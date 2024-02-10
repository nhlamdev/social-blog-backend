import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './question.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity]), StorageModule],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService, TypeOrmModule.forFeature([QuestionEntity])],
})
export class QuestionModule {}
