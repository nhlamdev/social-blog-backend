import { IRefreshJwtPayload } from '@/shared/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../token/token.service';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies[
            configService.getOrThrow('auth.refreshSecretName')
          ];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('auth.refreshSecret'),
    });
  }

  async validate(payload: IRefreshJwtPayload) {
    // const date = new Date();

    const token = await this.tokenService.findRefreshTokenInCache({
      key: payload.key,
      member_id: payload.member_id,
    });

    if (!Boolean(token)) {
      throw new BadRequestException('Phiên đăng nhập không hợp lệ.');
    }

    return payload;
  }
}
