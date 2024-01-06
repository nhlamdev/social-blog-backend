import { RedisModule } from '@/cache/redis.module';
import { GlobalConfigModule } from '@/configuration/config.module';
import * as controllers from '@/controller';
import { DatabaseModule } from '@/database/database.module';
import * as entities from '@/database/entities';
import * as middleware from '@/middleware';
import * as services from '@/services';
import * as strategy from '@/strategies';
import { WebsocketModule } from '@/websocket/websocket.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RedisClientType } from 'redis';
import {
  cacheMemberFollows,
  cacheMemberRole,
  cacheMembersInfo,
} from './cache/handlers';

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
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    RedisModule,
    DatabaseModule,
    WebsocketModule,
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
  ],
  controllers: Object.entries(controllers).map((v) => v[1]),
  providers: [
    ...Object.entries(services).map((v) => v[1]),
    ...Object.entries(strategy).map((v) => v[1]),
  ],
})
export class AppModule {
  constructor(
    private readonly memberService: services.MemberService,
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
    const members = await this.memberService.findAll();
    await cacheMembersInfo(this.redisClient, members);
    await cacheMemberFollows(this.redisClient, members);
    await cacheMemberRole(this.redisClient, members);
  }
}
