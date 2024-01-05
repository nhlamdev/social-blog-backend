import { Module } from '@nestjs/common';
import * as controllers from './controller';
import * as services from './service';
import * as entities from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  controllers: Object.entries(controllers).map((v) => v[1]),
  imports: [
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
  ],
  providers: Object.entries(services).map((v) => v[1]),
})
export class ContentModule {}
