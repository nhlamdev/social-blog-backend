import { MemberService } from '@/module/member/member.service';
import { ISocialPayload, client_data } from '@/shared/types';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenService } from '../token/token.service';
import { SocialService } from './social.service';

@Controller()
@ApiTags('authentication')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly memberService: MemberService,
    private readonly tokenService: TokenService,
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
      const member = await this.socialService.socialVerifyExist(socialPayload);

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
      const member = await this.socialService.socialVerifyExist(socialPayload);

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
      const member = await this.socialService.socialVerifyExist(socialPayload);

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
}
