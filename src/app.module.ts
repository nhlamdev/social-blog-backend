import * as controllers from '@/controller';
import { DbConnectModule } from '@/database.module';
import * as entities from '@/entities';
import * as middleware from '@/middleware';
import * as services from '@/service';
import * as strategy from '@/strategy';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import type { RedisClientOptions } from 'redis';
import { WebsocketGateway } from './websocket.gateway';
import { queue_provider } from './providers';
import { BullModule } from '@nestjs/bull';
@Module({
  imports: [
    queue_provider,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
    }),
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    DbConnectModule,
  ],
  controllers: Object.entries(controllers).map((v) => v[1]),
  providers: [
    WebsocketGateway,
    ...Object.entries(services).map((v) => v[1]),
    ...Object.entries(strategy).map((v) => v[1]),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    Object.entries(middleware).forEach((v) => {
      consumer.apply(v[1]).forRoutes('*');
    });
  }
}
