import { MemberModule } from '@/module/member/member.module';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy, JwtRefreshStrategy } from '../strategies';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { SessionModule } from '@/module/session/session.module';

@Module({
  imports: [
    forwardRef(() => MemberModule),
    forwardRef(() => SessionModule),
    JwtModule.register({}),
  ],
  controllers: [TokenController],
  providers: [TokenService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [TokenService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class TokenModule {}
