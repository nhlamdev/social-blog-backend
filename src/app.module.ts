import { GlobalConfigModule } from '@/configuration/config.module';
import { DatabaseModule } from '@/database/database.module';
import * as middleware from '@/middleware';
import { WebsocketModule } from '@/websocket/websocket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { RootModule } from './module/root.Module';
import { SharedModule } from './helper/shared.module';
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    AuthModule,
    SharedModule,
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
