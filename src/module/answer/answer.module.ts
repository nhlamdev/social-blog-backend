import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerEntity } from './answer.entity';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnswerEntity]), QuestionModule],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService, TypeOrmModule.forFeature([AnswerEntity])],
})
export class AnswerModule {}
