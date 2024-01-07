import { MemberService } from '@/module/member/member.service';
import {
  IAccessJwtPayload,
  IRefreshJwtPayload,
  ISocialPayload,
  client_data,
} from '@/shared/types';
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
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService, TokenService } from '../services';
import { MaybeType } from '@/shared/utils/types/maybe.type';

@ApiTags('social-authentication')
@Controller()
export class SocialController {
  constructor(
    private readonly authService: AuthService,
    private readonly memberService: MemberService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Đăng nhập bằng google.',
  })
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Nơi google trả về data sao đăng nhập.',
  })
  async googleLoginCallback(@Req() req, @Res() res) {
    const socialPayload: ISocialPayload = req.user;
    const client_data: client_data = req.user;

    if (socialPayload) {
      const member = await this.authService.socialVerifyExist(socialPayload);

      const refreshTokenGenerator = await this.tokenService.createRefreshToken({
        client: client_data,
        member_id: member._id,
        social_payload: socialPayload,
      });

      const accessTokenGenerator = await this.tokenService.createAccessToken({
        member: member,
        token_refresh_id: refreshTokenGenerator.token,
      });

      res.cookie(accessTokenGenerator.name, accessTokenGenerator.token, {
        maxAge: accessTokenGenerator.expires,
        httpOnly: false,
      });
      res.cookie(refreshTokenGenerator.name, refreshTokenGenerator.token, {
        maxAge: refreshTokenGenerator.expires,
        httpOnly: false,
      });
      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'Đăng nhập bằng github.',
  })
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'Nơi github trả về data sao đăng nhập.',
  })
  async githubLoginCallback(@Req() req, @Res() res) {
    const socialPayload: ISocialPayload = req.user;
    const client_data: client_data = req.user;

    if (socialPayload) {
      const member = await this.authService.socialVerifyExist(socialPayload);

      const refreshTokenGenerator = await this.tokenService.createRefreshToken({
        client: client_data,
        member_id: member._id,
        social_payload: socialPayload,
      });

      const accessTokenGenerator = await this.tokenService.createAccessToken({
        member: member,
        token_refresh_id: refreshTokenGenerator.token,
      });

      res.cookie(accessTokenGenerator.name, accessTokenGenerator.token, {
        maxAge: accessTokenGenerator.expires,
        httpOnly: false,
      });
      res.cookie(refreshTokenGenerator.name, refreshTokenGenerator.token, {
        maxAge: refreshTokenGenerator.expires,
        httpOnly: false,
      });
      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  @ApiOperation({
    summary: 'Đăng nhập bằng discord.',
  })
  async discordLogin() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  @ApiOperation({
    summary: 'Nơi discord trả về data sao đăng nhập.',
  })
  async discordLoginCallback(@Req() req, @Res() res) {
    const socialPayload: ISocialPayload = req.user;
    const client_data: client_data = req.user;

    if (socialPayload) {
      const member = await this.authService.socialVerifyExist(socialPayload);

      const refreshTokenGenerator = await this.tokenService.createRefreshToken({
        client: client_data,
        member_id: member._id,
        social_payload: socialPayload,
      });

      const accessTokenGenerator = await this.tokenService.createAccessToken({
        member: member,
        token_refresh_id: refreshTokenGenerator.token,
      });

      res.cookie(accessTokenGenerator.name, accessTokenGenerator.token, {
        maxAge: accessTokenGenerator.expires,
        httpOnly: false,
      });
      res.cookie(refreshTokenGenerator.name, refreshTokenGenerator.token, {
        maxAge: refreshTokenGenerator.expires,
        httpOnly: false,
      });
      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('renew-token')
  @ApiTags('member-auth')
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
  @ApiTags('member-auth')
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
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  async loginStatusByMember(@Req() req, @Param('id') id) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn.');
    }

    const tokens = this.tokenService.tokenStatusByMember(id);

    return tokens;
  }

  @Delete('logout')
  @ApiTags('member-auth')
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
  @ApiTags('member-auth')
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
