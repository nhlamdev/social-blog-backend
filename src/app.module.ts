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
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
    }),
    CacheModule.register(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    DbConnectModule,
  ],
  controllers: Object.entries(controllers).map((v) => v[1]),
  providers: [
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
