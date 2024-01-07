import { Module, forwardRef } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ContentModule } from '../content/content.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '@/database/entities';
import { RedisModule } from '@/helper/cache/redis.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => ContentModule),
    TypeOrmModule.forFeature([CategoryEntity]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, TypeOrmModule.forFeature([CategoryEntity])],
})
export class CategoryModule {}
