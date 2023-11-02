import { RefreshJwtPayload } from '@/interface';
import { AuthService } from '@/service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
const { REFRESH_TOKEN_NAME, REFRESH_TOKEN_SECRET } = process.env;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
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
      await this.authService.removeSession(payload.session_id);
      throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    }

    return payload;
  }
}
