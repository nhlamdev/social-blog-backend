import { IAccessJwtPayload } from '@/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(configService: ConfigService) {
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
    // const date = new Date();

    // if (
    //   date.getTime() >
    //   new Date(payload.create_at).getTime() + payload.expired
    // ) {
    //   throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    // }

    // const sessionExist = await this.authService.checkSessionExist(
    //   payload.session_id,
    // );

    // if (!sessionExist) {
    //   throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    // }

    // const memberExist = await this.memberService.checkMemberExistById(
    //   payload._id,
    // );

    // if (!memberExist) {
    //   throw new UnauthorizedException('Thành viên không tồn tại.');
    // }

    return payload;
  }
}
