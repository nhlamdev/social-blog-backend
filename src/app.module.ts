import { AuthModule } from '@/auth/auth.module';
import { GlobalConfigModule } from '@/configuration/config.module';
import { ContentModule } from '@/content/content.module';
import { DatabaseModule } from '@/database/database.module';
import { FileModule } from '@/file/file.module';
import { MemberModule } from '@/member/member.module';
import * as middleware from '@/middleware';
import { WebsocketModule } from '@/websocket/websocket.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import {
  Inject,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MemberService } from '@/member/service';
import { RedisClientType } from 'redis';
import { RedisModule } from '@/shared/cache/redis.module';

@Module({
  imports: [
    GlobalConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    DatabaseModule,
    WebsocketModule,
    MemberModule,
    AuthModule,
    FileModule,
    ContentModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly memberService: MemberService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {
    this.redisClient.connect();
  }
  configure(consumer: MiddlewareConsumer) {
    Object.entries(middleware).forEach((v) => {
      consumer.apply(v[1]).forRoutes('*');
    });
  }
  async onModuleInit() {
    await this.redisClient.FLUSHDB();

    const members = await this.memberService.findAll({
      select: {
        _id: true,
        name: true,
        email: true,
        image: true,
        follow_by: true,
        created_at: true,
        role_author: true,
        role_comment: true,
        role_owner: true,
      },
    });

    for (const member of members) {
      await this.redisClient.HSET(`member:${member._id}`, 'name', member.name);
      await this.redisClient.HSET(
        `member:${member._id}`,
        'email',
        member.email,
      );
      await this.redisClient.HSET(
        `member:${member._id}`,
        'image',
        member.image,
      );
      await this.redisClient.HSET(
        `member:${member._id}`,
        'created_at',
        member.created_at.toString(),
      );
    }
  }
}
