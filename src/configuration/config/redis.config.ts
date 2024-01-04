import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { RedisEnvironmentVariablesValidator } from '../validator/redis.validator';
import { TypeRedisConfig } from '../types/redis.type';

export const redisConfig = registerAs<TypeRedisConfig>('redis', () => {
  validateConfig(process.env, RedisEnvironmentVariablesValidator);

  return {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    account: process.env.REDIS_ACCOUNT,
  };
});
