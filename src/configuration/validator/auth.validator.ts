import { IsInt, IsString } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class AuthEnvironmentVariablesValidator {
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsInt()
  ACCESS_TOKEN_EXPIRES: number;

  @IsString()
  ACCESS_TOKEN_NAME: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsInt()
  REFRESH_TOKEN_EXPIRES: number;

  @IsString()
  REFRESH_TOKEN_NAME: string;
}
