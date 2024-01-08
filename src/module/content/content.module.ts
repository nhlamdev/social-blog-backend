import { ContentEntity } from '@/database/entities';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { SeriesModule } from '../series/series.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { TokenModule } from '@/auth/token/token.module';

@Module({
  imports: [
    forwardRef(() => SeriesModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => TokenModule),
    TypeOrmModule.forFeature([ContentEntity]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService, TypeOrmModule.forFeature([ContentEntity])],
})
export class ContentModule {}
