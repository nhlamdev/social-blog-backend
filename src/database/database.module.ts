import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService,
      ): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.account'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
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
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
