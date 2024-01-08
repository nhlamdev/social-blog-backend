import { TokenModule } from '@/auth/token/token.module';
import { CategoryEntity } from '@/database/entities';
import { RedisModule } from '@/helper/cache/redis.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => ContentModule),
    forwardRef(() => TokenModule),
    TypeOrmModule.forFeature([CategoryEntity]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, TypeOrmModule.forFeature([CategoryEntity])],
})
export class CategoryModule {}
