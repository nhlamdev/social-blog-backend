import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from '@/database/entities';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.account'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: Object.entries(entities).map((v) => v[1]),
        synchronize: configService.get('app.nodeEnv') !== 'production',
        autoLoadEntities: configService.get('app.nodeEnv') !== 'production',
        // logging: true,
        cache: true,
        dropSchema: false,
        keepConnectionAlive: true,
        extra: {
          trustServerCertificate: true,
          max: 10,
        },
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
})
export class DbConnectModule {}
