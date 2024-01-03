import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { redisProvider } from '../provider/redis.provider';

@Module({
  imports: [ConfigModule],
  providers: [redisProvider],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
