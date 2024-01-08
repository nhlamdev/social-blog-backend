import { ContentEntity } from '@/database/entities';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { CommentService } from '../comment/comment.service';
import { SeriesModule } from '../series/series.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [
    forwardRef(() => SeriesModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => CommentService),
    TypeOrmModule.forFeature([ContentEntity]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService, TypeOrmModule.forFeature([ContentEntity])],
})
export class ContentModule {}
