import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { RedisEnvironmentVariablesValidator } from './validator/redis.validator';
import { TypeRedisConfig } from './types/redis.type';

export const emailConfig = registerAs<TypeRedisConfig>('redis', () => {
  validateConfig(process.env, RedisEnvironmentVariablesValidator);

  return {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    password: process.env.EMAIL_PASSWORD,
    account: process.env.EMAIL_ACCOUNT,
  };
});
