import * as entities from '@/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as controllers from './controller';
import * as services from './service';
import * as strategies from './strategies';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.entries(entities).map((v) => v[1])),
    JwtModule.register({}),
  ],
  controllers: [...Object.entries(controllers).map((v) => v[1])],
  providers: [
    ...Object.entries(services).map((v) => v[1]),
    ...Object.entries(strategies).map((v) => v[1]),
  ],
  exports: [...Object.entries(services).map((v) => v[1])],
})
export class AuthModule {}
