import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshJwtPayload } from '@/interface';
const { REFRESH_TOKEN_NAME, REFRESH_TOKEN_SECRET } = process.env;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies[REFRESH_TOKEN_NAME];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: RefreshJwtPayload) {
    const date = new Date();

    if (
      date.getTime() >
      new Date(payload.create_at).getTime() + payload.expired
    ) {
      throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    }

    return payload;
  }
}
