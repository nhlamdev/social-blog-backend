import { Module } from '@nestjs/common';
import { SocialModule } from './social/social.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [TokenModule, SocialModule],
  exports: [TokenModule, SocialModule],
})
export class AuthModule {}
