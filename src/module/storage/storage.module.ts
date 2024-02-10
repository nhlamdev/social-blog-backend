import { Module, forwardRef } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from '@/auth/token/token.module';
import { StorageEntity } from './storage.entity';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StorageEntity]),
    forwardRef(() => TokenModule),
    forwardRef(() => MemberModule),
  ],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService, TypeOrmModule.forFeature([StorageEntity])],
})
export class StorageModule {}
