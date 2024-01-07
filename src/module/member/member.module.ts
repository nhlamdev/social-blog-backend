import { MemberEntity } from '@/database/entities';
import { RedisModule } from '@/helper/cache/redis.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([MemberEntity])],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService, TypeOrmModule.forFeature([MemberEntity])],
})
export class MemberModule {}
