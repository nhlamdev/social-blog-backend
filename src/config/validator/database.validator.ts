import { IsInt, IsString } from 'class-validator';

export class DatabaseEnvironmentVariablesValidator {
  @IsString()
  DATABASE_HOST: string;

  @IsString()
  DATABASE_TYPE: string;

  @IsInt()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_ACCOUNT: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_DB_NAME: string;
}
