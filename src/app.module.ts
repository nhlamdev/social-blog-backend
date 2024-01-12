import { GlobalConfigModule } from '@/configuration/config.module';
import { DatabaseModule } from '@/database/database.module';
import * as middleware from '@/middleware';
import { WebsocketModule } from '@/websocket/websocket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { RootModule } from './module/root.Module';
@Module({
  imports: [
    GlobalConfigModule,

    CacheModule.register({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
    }),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    AuthModule,
    RootModule,
    DatabaseModule,
    WebsocketModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    Object.entries(middleware).forEach((v) => {
      consumer.apply(v[1]).forRoutes('*');
    });
  }
}
