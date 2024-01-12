import { TokenService } from '@/auth/token/token.service';
import { IRefreshJwtPayload } from '@/shared/types';
import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModule } from '../member/member.module';
import { SeriesEntity } from '../series/series.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([SeriesEntity]),
    forwardRef(() => MemberModule),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService, TypeOrmModule.forFeature([SeriesEntity])],
})
export class SessionModule implements OnModuleInit {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
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
        expires: session.expires_in * 1000,
      });
    }
  }
}
