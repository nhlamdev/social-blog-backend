import { MemberService } from '@/module/member/member.service';
import { IAccessJwtPayload, IRefreshJwtPayload } from '@/shared/types';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
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

    const token = this.tokenService.checkExistTokenInCache(jwtPayload);

    if (!token) {
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

  @Get('all-login-status')
  @UseGuards(AuthGuard('jwt-access'))
  async loginStatus(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn.');
    }

    const tokens = this.tokenService.allTokenStatus();

    return tokens;
  }

  @Get('all-login-status-by-member/:id')
  @UseGuards(AuthGuard('jwt-access'))
  async loginStatusByMember(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn.');
    }

    const tokens = this.tokenService.tokenStatusByMember(id);

    return tokens;
  }

  @Delete('logout')
  @UseGuards(AuthGuard('jwt-access'))
  async login(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const token = await this.tokenService.verifyRefreshToken(
      jwtPayload.refresh_token,
    );

    const exist = await this.tokenService.checkExistTokenInCache(token);

    if (!exist) {
      throw new BadRequestException('Phiên đăng nhập không hợp lệ.');
    }

    await this.tokenService.removeTokenByKeyAndMember(
      jwtPayload._id,
      token.key,
    );

    return 'logout success';
  }

  @Delete('logout-force/:token')
  @UseGuards(AuthGuard('jwt-access'))
  async forceLogin(@Req() req, @Param('token') token: MaybeType<string>) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const tokenData = await this.tokenService.verifyRefreshToken(token);

    const exist = await this.tokenService.checkExistTokenInCache(tokenData);

    if (!exist) {
      throw new BadRequestException('Phiên đăng nhập không hợp lệ.');
    }

    await this.tokenService.removeTokenByKeyAndMember(
      jwtPayload._id,
      tokenData.key,
    );

    return 'logout success';
  }
}
