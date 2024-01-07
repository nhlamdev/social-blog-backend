import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesEntity } from '@/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SeriesEntity])],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService, TypeOrmModule.forFeature([SeriesEntity])],
})
export class SeriesModule {}
