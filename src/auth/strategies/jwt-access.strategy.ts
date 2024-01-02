import { AccessJwtPayload } from '@/interface';
import { AuthService, MemberService } from '@/auth/service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const { ACCESS_TOKEN_NAME, ACCESS_TOKEN_SECRET } = process.env;

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
  ) {
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

  async validate(payload: AccessJwtPayload): Promise<AccessJwtPayload> {
    const date = new Date();

    if (
      date.getTime() >
      new Date(payload.create_at).getTime() + payload.expired
    ) {
      throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    }

    const sessionExist = await this.authService.checkSessionExist(
      payload.session_id,
    );

    if (!sessionExist) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    }

    const memberExist = await this.memberService.checkMemberExistById(
      payload._id,
    );

    if (!memberExist) {
      throw new UnauthorizedException('Thành viên không tồn tại.');
    }

    return payload;
  }
}
