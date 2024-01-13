import validateConfig from '@/shared/utils/validate-config';
import { TypeAppConfig } from '../types/app.type';
import { AppEnvironmentVariablesValidator } from '../validator/app.validator';
import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs<TypeAppConfig>('app', () => {
  validateConfig(process.env, AppEnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    domain: process.env.APP_DOMAIN,
    port: Number(process.env.APP_PORT),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    workingDirectory: process.cwd(),
  };
});
