import * as controllers from '@/controller';
import { DbConnectModule } from '@/database.module';
import * as entities from '@/entities';
import * as middleware from '@/middleware';
import * as services from '@/service';
import * as strategy from '@/strategy';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import type { RedisClientOptions } from 'redis';
import { WebsocketGateway } from './websocket.gateway';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
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
    {
      provide: 'SUBSCRIBERS_SERVICE',
      useFactory: (configService: ConfigService) => {
        const user = configService.get('RABBITMQ_USER');
        const password = configService.get('RABBITMQ_PASSWORD');
        const host = configService.get('RABBITMQ_HOST');
        const queueName = configService.get('RABBITMQ_QUEUE_NOTIFY_NAME');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${user}:${password}@${host}`],
            queue: queueName,
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SUBSCRIBERS_SERVICE',
      useFactory: (configService: ConfigService) => {
        const user = configService.get('RABBITMQ_USER');
        const password = configService.get('RABBITMQ_PASSWORD');
        const host = configService.get('RABBITMQ_HOST');
        const queueName = configService.get('RABBITMQ_QUEUE_MAIL_NAME');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${user}:${password}@${host}`],
            queue: queueName,
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [ConfigService],
    },
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
