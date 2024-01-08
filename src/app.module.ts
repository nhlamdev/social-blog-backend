import { GlobalConfigModule } from '@/configuration/config.module';
import { DatabaseModule } from '@/database/database.module';
import { RedisModule } from '@/helper/cache/redis.module';
import * as middleware from '@/middleware';
import { WebsocketModule } from '@/websocket/websocket.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RedisClientType } from 'redis';
import { AuthModule } from './auth/auth.module';
import { RootModule } from './module/root.Module';
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
    AuthModule,
    RootModule,
    DatabaseModule,
    WebsocketModule,
  ],
})
export class AppModule {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {
    this.redisClient.connect();
  }

  configure(consumer: MiddlewareConsumer) {
    Object.entries(middleware).forEach((v) => {
      consumer.apply(v[1]).forRoutes('*');
    });
  }

  // async onModuleInit() {
  //   const members = await this.memberService.findAll();
  //   await cacheMembersInfo(this.redisClient, members);
  //   await cacheMemberFollows(this.redisClient, members);
  //   await cacheMemberRole(this.redisClient, members);
  // }
}
