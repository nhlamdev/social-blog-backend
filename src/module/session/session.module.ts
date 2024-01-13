import { TokenModule } from '@/auth/token/token.module';
import { TokenService } from '@/auth/token/token.service';
import { IRefreshJwtPayload } from '@/shared/types';
import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModule } from '../member/member.module';
import { SessionController } from './session.controller';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity]),
    forwardRef(() => MemberModule),
    forwardRef(() => TokenModule),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService, TypeOrmModule.forFeature([SessionEntity])],
})
export class SessionModule implements OnModuleInit {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
    console.log('start cache session');
    const sessions = await this.sessionService.findAll({
      relations: { created_by: true },
    });
    for (const session of sessions) {
      const token: IRefreshJwtPayload = {
        key: session.token_key,
        member_id: session.created_by._id,
        session_id: session._id,
      };
      await this.tokenService.cacheRefreshToken({
        token,
        expires: session.expires_in,
      });
    }
    console.log('end cache session');
  }
}
