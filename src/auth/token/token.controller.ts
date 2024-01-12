import { MemberService } from '@/module/member/member.service';
import { IAccessJwtPayload, IRefreshJwtPayload } from '@/shared/types';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';

@ApiTags('token')
@Controller()
export class TokenController {
  constructor(
    private readonly memberService: MemberService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('renew-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  async renewToken(@Req() req, @Res() res) {
    const jwtPayload: IRefreshJwtPayload = req.user;

    const token = this.tokenService.findRefreshTokenInCache({
      key: jwtPayload.key,
      member_id: jwtPayload.member_id,
    });

    if (!Boolean(token)) {
      throw new BadRequestException('Phiên đăng nhập không hợp lệ.');
    }

    const member = await this.memberService.findOne({
      where: { _id: jwtPayload.member_id },
    });

    if (Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại.');
    }

    const accessTokenGenerator = await this.tokenService.createAccessToken({
      member: member,
      token_refresh_id: jwtPayload.key,
    });

    res.cookie(accessTokenGenerator.name, accessTokenGenerator.token, {
      maxAge: accessTokenGenerator.expires,
      httpOnly: false,
    });

    res.status(200).json({ message: 'renew success' });
  }

  @Delete('logout')
  @UseGuards(AuthGuard('jwt-access'))
  async login(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const refreshToken = await this.tokenService.verifyRefreshToken(
      jwtPayload.refresh_token,
    );

    const token = await this.tokenService.findRefreshTokenInCache({
      key: refreshToken.key,
      member_id: refreshToken.member_id,
    });

    if (!Boolean(token)) {
      throw new BadRequestException('Phiên đăng nhập không hợp lệ.');
    }

    await this.tokenService.removeRefreshTokenByKeyAndMember({
      key: token.key,
      member_id: token.member_id,
    });

    return 'logout success';
  }
}
