import { IsInt, IsString } from 'class-validator';

export class RedisEnvironmentVariablesValidator {
  @IsString()
  EMAIL_HOST: string;

  @IsInt()
  EMAIL_PORT: number;

  @IsString()
  EMAIL_PASSWORD: string;

  @IsString()
  EMAIL_ACCOUNT: string;
}
