import { Module, forwardRef } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { TokenModule } from '@/auth/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    forwardRef(() => TokenModule),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService, TypeOrmModule.forFeature([FileEntity])],
})
export class FileModule {}
