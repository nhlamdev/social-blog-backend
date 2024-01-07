import { RedisModule } from '@/helper/cache/redis.module';
import { MemberModule } from '@/module/member/member.module';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from '../token/token.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

@Module({
  imports: [
    forwardRef(() => MemberModule),
    forwardRef(() => TokenModule),
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
