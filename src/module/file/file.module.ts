import { Module, forwardRef } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from '@/auth/token/token.module';
import { FileEntity } from './file.entity';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    forwardRef(() => TokenModule),
    forwardRef(() => MemberModule),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService, TypeOrmModule.forFeature([FileEntity])],
})
export class FileModule {}
