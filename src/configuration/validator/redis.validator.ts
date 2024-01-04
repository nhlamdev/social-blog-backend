import { IsInt, IsString } from 'class-validator';

export class RedisEnvironmentVariablesValidator {
  @IsString()
  REDIS_HOST: string;

  @IsInt()
  REDIS_PORT: number;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  REDIS_ACCOUNT: string;
}
