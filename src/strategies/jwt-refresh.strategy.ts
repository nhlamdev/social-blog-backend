import { IRefreshJwtPayload } from '@/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
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

    // if (date.getTime() > new Date().getTime() + payload.expired) {
    //   await this.authService.removeSession(payload.session_id);
    //   throw new BadRequestException('Phiên đăng nhập quá hạn.');
    // }

    return payload;
  }
}
