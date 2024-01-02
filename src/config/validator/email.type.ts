import { IsInt, IsString } from 'class-validator';

export class EmailEnvironmentVariablesValidator {
  @IsString()
  EMAIL_HOST: string;

  @IsInt()
  EMAIL_PORT: number;

  @IsString()
  EMAIL_PASSWORD: string;

  @IsString()
  EMAIL_ACCOUNT: string;
}
