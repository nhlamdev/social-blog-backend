import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessJwtPayload, RefreshJwtPayload } from '@/interface';

@Controller()
export class SocialControllerController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async socialVerify(req: any, res: any) {
    const { user } = req;

    if (user) {
      const member = await this.authService.socialVerifyExist(user);

      const session = await this.authService.createSession({
        client: req.client_data,
        member_id: member._id,
        provider: user.provider,
        provider_id: user.id,
        sessionAge: this.configService.get('auth.refreshExpires'),
      });

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: this.configService.get('auth.refreshExpires'),
        create_at: new Date().toString(),
      };

      const accessTokenData: AccessJwtPayload = {
        _id: member._id,
        name: member.name,
        email: member.email,
        image: member.image,
        role_author: member.role_author,
        role_comment: member.role_comment,
        role_owner: member.role_owner,
        expired: this.configService.get('auth.expires'),
        session_id: session._id,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: this.configService.get('auth.secret'),
      });

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: this.configService.get('auth.refreshSecret'),
      });

      res.cookie(this.configService.get('auth.secretName'), accessToken, {
        maxAge: this.configService.get('auth.expires'),
        httpOnly: false,
      });

      res.cookie(
        this.configService.get('auth.refreshSecretName'),
        refreshToken,
        {
          maxAge: this.configService.get('auth.refreshExpires'),
          httpOnly: false,
        },
      );

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('google')
  @ApiTags('social-auth')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Đăng nhập bằng google.',
  })
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiTags('social-auth')
  @ApiOperation({
    summary: 'Nơi google trả về data sao đăng nhập.',
  })
  async googleLoginCallback(@Req() req, @Res() res) {
    await this.socialVerify(req, res);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiTags('social-auth')
  @ApiOperation({
    summary: 'Đăng nhập bằng github.',
  })
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiTags('social-auth')
  @ApiOperation({
    summary: 'Nơi github trả về data sao đăng nhập.',
  })
  async githubLoginCallback(@Req() req, @Res() res) {
    await this.socialVerify(req, res);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  @ApiTags('social-auth')
  @ApiOperation({
    summary: 'Đăng nhập bằng discord.',
  })
  async discordLogin() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  @ApiTags('social-auth')
  @ApiOperation({
    summary: 'Nơi discord trả về data sao đăng nhập.',
  })
  async discordLoginCallback(@Req() req, @Res() res) {
    await this.socialVerify(req, res);
  }
}
