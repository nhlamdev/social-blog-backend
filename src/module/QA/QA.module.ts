import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '../member/member.entity';
import { QAController } from './QA.controller';
import { QAEntity } from './QA.entity';
import { QAService } from './QA.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QAEntity]),
    forwardRef(() => MemberEntity),
  ],
  controllers: [QAController],
  providers: [QAService],
  exports: [QAService, TypeOrmModule.forFeature([QAEntity])],
})
export class QAModule {}
