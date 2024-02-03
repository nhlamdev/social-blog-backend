import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './question.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity]), FileModule],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService, TypeOrmModule.forFeature([QuestionEntity])],
})
export class QuestionModule {}
