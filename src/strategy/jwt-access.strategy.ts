import { MemberEntity } from '@/entities';
import { AccessJwtPayload } from '@/interface';
import { AuthService } from '@/service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const { ACCESS_TOKEN_NAME, ACCESS_TOKEN_SECRET } = process.env;

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly authService: AuthService) {
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

  async validate(payload: AccessJwtPayload): Promise<MemberEntity> {
    const date = new Date();

    if (
      date.getTime() >
      new Date(payload.create_at).getTime() + payload.expired
    ) {
      throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    }

    const member = await this.authService.memberByIdWidthRole(payload._id);

    if (!Boolean(member)) {
      throw new UnauthorizedException('Thành viên không tồn tại.');
    }

    return member;
  }
}
