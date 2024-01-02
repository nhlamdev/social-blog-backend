import { registerAs } from '@nestjs/config';
import { TypeAuthConfig } from './types/auth.type';
import { AuthEnvironmentVariablesValidator } from './validator/auth.validator';
import validateConfig from '@/utils/validate-config';

export const AuthConfig = registerAs<TypeAuthConfig>('auth', () => {
  validateConfig(process.env, AuthEnvironmentVariablesValidator);

  return {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expires: Number(process.env.ACCESS_TOKEN_EXPIRES),
    secretName: process.env.ACCESS_TOKEN_NAME,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpires: Number(process.env.REFRESH_TOKEN_EXPIRES),
    refreshSecretName: process.env.REFRESH_TOKEN_NAME,
  };
});
