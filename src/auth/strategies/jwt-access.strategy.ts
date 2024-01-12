import { IAccessJwtPayload } from '@/shared/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../token/token.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies[configService.getOrThrow('auth.secretName')];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('auth.secret'),
    });
  }

  async validate(payload: IAccessJwtPayload): Promise<IAccessJwtPayload> {
    const date = new Date();

    if (
      date.getTime() >
      new Date(payload.token_created_at).getTime() + Number(payload.expired)
    ) {
      throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    }

    const refreshToken = await this.tokenService.verifyRefreshToken(
      payload.refresh_token,
    );

    const token = await this.tokenService.findRefreshTokenInCache({
      key: refreshToken.key,
      member_id: refreshToken.member_id,
    });

    if (!Boolean(token)) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    }

    return payload;
  }
}
