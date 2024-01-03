import * as config from '@/config';
import { DbConnectModule } from '@/database.module';
import * as middleware from '@/middleware';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/member.module';
import { RedisModule } from './helper/cache/redis.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.entries(config).map((v) => v[1]),
    }),
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
    DbConnectModule,
    SharedModule,
    AuthModule,
    RedisModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor() {}
  configure(consumer: MiddlewareConsumer) {
    Object.entries(middleware).forEach((v) => {
      consumer.apply(v[1]).forRoutes('*');
    });
  }
  async onModuleInit() {}
}
