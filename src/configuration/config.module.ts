import { Module } from '@nestjs/common';
import * as config from './config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.entries(config).map((v) => v[1]),
    }),
  ],
})
export class GlobalConfigModule {}
