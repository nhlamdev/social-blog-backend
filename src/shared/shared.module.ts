import * as entities from '@/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as controllers from './controller';
import * as services from './service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
    BullModule.registerQueue({
      name: 'MAIL_QUEUE',
      settings: {},
      limiter: { max: 30, duration: 1000 },
    }),
  ],
  controllers: [...Object.entries(controllers).map((v) => v[1])],
  providers: [...Object.entries(services).map((v) => v[1])],
})
export class SharedModule {}
