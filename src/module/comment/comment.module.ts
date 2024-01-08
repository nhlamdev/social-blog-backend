import { Module, forwardRef } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '@/database/entities';
import { ContentModule } from '../content/content.module';
import { MemberModule } from '../member/member.module';
import { TokenModule } from '@/auth/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    forwardRef(() => ContentModule),
    forwardRef(() => MemberModule),
    forwardRef(() => TokenModule),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService, TypeOrmModule.forFeature([CommentEntity])],
})
export class CommentModule {}
