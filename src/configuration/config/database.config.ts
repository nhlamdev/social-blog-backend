import { registerAs } from '@nestjs/config';
import validateConfig from '@/shared/utils/validate-config';
import { TypeDatabaseConfig } from '../types/database.type';
import { DatabaseEnvironmentVariablesValidator } from '../validator/database.validator';

export const databaseConfig = registerAs<TypeDatabaseConfig>('database', () => {
  validateConfig(process.env, DatabaseEnvironmentVariablesValidator);

  return {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    account: process.env.DATABASE_ACCOUNT,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB_NAME,
  };
});
