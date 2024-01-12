import { TokenModule } from '@/auth/token/token.module';
import { RedisModule } from '@/helper/cache/redis.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberEntity } from './member.entity';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([MemberEntity]),
    forwardRef(() => TokenModule),
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService, TypeOrmModule.forFeature([MemberEntity])],
})
export class MemberModule {}
