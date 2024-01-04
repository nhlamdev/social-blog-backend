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
import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    DatabaseModule,
    WebsocketModule,
    MemberModule,
    AuthModule,
    FileModule,
    ContentModule,
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
