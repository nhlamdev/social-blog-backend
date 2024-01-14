import validateConfig from '@/shared/utils/validate-config';
import { TypeAppConfig } from '../types/app.type';
import { AppEnvironmentVariablesValidator } from '../validator/app.validator';
import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs<TypeAppConfig>('app', () => {
  const mode = (
    process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
  ).trim();

  validateConfig(process.env, AppEnvironmentVariablesValidator);

  return {
    nodeEnv: mode,
    domain: process.env.APP_DOMAIN,
    port: Number(process.env.APP_PORT),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    workingDirectory: process.cwd(),
  };
});
