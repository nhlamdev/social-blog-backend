import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccessJwtPayload } from '@/interface';

const { ACCESS_TOKEN_NAME, ACCESS_TOKEN_SECRET } = process.env;

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies[ACCESS_TOKEN_NAME];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: AccessJwtPayload) {
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
