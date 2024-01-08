import { Module, forwardRef } from '@nestjs/common';
import { TokenService } from './token.service';
import { RedisModule } from '@/helper/cache/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenController } from './token.controller';
import { MemberModule } from '@/module/member/member.module';
import { JwtAccessStrategy, JwtRefreshStrategy } from '../strategies';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => MemberModule),
    JwtModule.register({}),
  ],
  controllers: [TokenController],
  providers: [TokenService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [TokenService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class TokenModule {}
