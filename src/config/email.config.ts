import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { TypeEmailConfig } from './types/email.type';
import { EmailEnvironmentVariablesValidator } from './validator/email.type';

export const emailConfig = registerAs<TypeEmailConfig>('email', () => {
  validateConfig(process.env, EmailEnvironmentVariablesValidator);

  return {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    password: process.env.EMAIL_PASSWORD,
    account: process.env.EMAIL_ACCOUNT,
  };
});
