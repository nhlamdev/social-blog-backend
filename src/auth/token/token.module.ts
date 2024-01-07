import { Module, forwardRef } from '@nestjs/common';
import { TokenService } from './token.service';
import { RedisModule } from '@/helper/cache/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenController } from './token.controller';
import { MemberModule } from '@/module/member/member.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => MemberModule),
    JwtModule.register({}),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
