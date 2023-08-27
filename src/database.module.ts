import * as entities from '@/entities';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_ACCOUNT,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      entities: Object.entries(entities).map((v) => v[1]),
      synchronize: true,
      autoLoadEntities: true,
      // logging: true,
      cache: true,
      extra: {
        trustServerCertificate: true,
      },
    }),
  ],
})
export class DbConnectModule {}
