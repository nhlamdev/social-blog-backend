import { RedisModule } from '@/shared/cache/redis.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as controllers from './controller';
import * as entities from './entities';
import * as services from './service';

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [...Object.entries(controllers).map((v) => v[1])],
  providers: [...Object.entries(services).map((v) => v[1])],
  exports: [...Object.entries(services).map((v) => v[1])],
})
export class MemberModule {}
