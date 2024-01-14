import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUrl, Max, Min } from 'class-validator';

export enum Environment {
  development = 'development',
  production = 'production',
  test = 'test',
}

export class AppEnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    const transform = (value ? value : 'development').trim();

    return transform;
  })
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  APP_DOMAIN: string;
}
