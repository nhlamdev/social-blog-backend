import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/services';
import { JwtService } from '@nestjs/jwt';
import { ISocialPayload } from '@/types';

@ApiTags('social-authentication')
@Controller()
export class SocialController {
  private readonly ACCESS_TOKEN_NAME = process.env.ACCESS_TOKEN_NAME;
  private readonly REFRESH_TOKEN_NAME = process.env.REFRESH_TOKEN_NAME;

  private readonly ACCESS_TOKEN_AGE = 1000 * 60;
  private readonly REFRESH_TOKEN_AGE = 1000 * 60 * 60 * 24 * 30 * 6;

  constructor(
    private readonly authService: AuthService,
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

    // if (user) {
    //   const member = await this.authService.socialVerifyExist(socialPayload);
    //   const session = await this.authService.createSession({
    //     client: req.client_data,
    //     member,
    //     provider: user.provider,
    //     provider_id: user.id,
    //     sessionAge: this.REFRESH_TOKEN_AGE,
    //   });
    //   const refreshTokenData: IRefreshJwtPayload = {
    //     session_id: session._id,
    //     expired: this.REFRESH_TOKEN_AGE,
    //     create_at: new Date().toString(),
    //   };
    //   const accessTokenData: IAccessJwtPayload = {
    //     _id: member._id,
    //     name: member.name,
    //     email: member.email,
    //     image: member.image,
    //     role_author: member.role_author,
    //     role_comment: member.role_comment,
    //     role_owner: member.role_owner,
    //     expired: this.ACCESS_TOKEN_AGE,
    //     session_id: session._id,
    //     create_at: new Date().toString(),
    //   };
    //   const accessToken = await this.jwtService.sign(accessTokenData, {
    //     secret: process.env.ACCESS_TOKEN_SECRET,
    //   });
    //   const refreshToken = await this.jwtService.sign(refreshTokenData, {
    //     secret: process.env.REFRESH_TOKEN_SECRET,
    //   });
    //   res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
    //     maxAge: this.ACCESS_TOKEN_AGE,
    //     httpOnly: false,
    //   });
    //   res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
    //     maxAge: this.REFRESH_TOKEN_AGE,
    //     httpOnly: false,
    //   });
    //   res.redirect('/');
    // } else {
    //   res.redirect('/');
    // }
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
    const { user } = req;

    if (user) {
      //   const member = await this.authService.socialVerifyExist(user);

      //   const session = await this.authService.createSession({
      //     client: req.client_data,
      //     member,
      //     provider: user.provider,
      //     provider_id: user.id,
      //     sessionAge: this.REFRESH_TOKEN_AGE,
      //   });

      //   const refreshTokenData: IRefreshJwtPayload = {
      //     session_id: session._id,
      //     expired: this.REFRESH_TOKEN_AGE,
      //     create_at: new Date().toString(),
      //   };

      //   const accessTokenData: IAccessJwtPayload = {
      //     _id: member._id,
      //     name: member.name,
      //     email: member.email,
      //     image: member.image,
      //     role_author: member.role_author,
      //     role_comment: member.role_comment,
      //     role_owner: member.role_owner,
      //     expired: this.ACCESS_TOKEN_AGE,
      //     session_id: session._id,
      //     create_at: new Date().toString(),
      //   };

      //   const accessToken = await this.jwtService.sign(accessTokenData, {
      //     secret: process.env.ACCESS_TOKEN_SECRET,
      //   });

      //   const refreshToken = await this.jwtService.sign(refreshTokenData, {
      //     secret: process.env.REFRESH_TOKEN_SECRET,
      //   });

      //   res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
      //     maxAge: this.ACCESS_TOKEN_AGE,
      //     httpOnly: false,
      //   });

      //   res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      //     maxAge: this.REFRESH_TOKEN_AGE,
      //     httpOnly: false,
      //   });

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
    const { user } = req;

    if (user) {
      //   const member = await this.authService.socialVerifyExist(user);

      //   const session = await this.authService.createSession({
      //     client: req.client_data,
      //     member,
      //     provider: user.provider,
      //     provider_id: user.id,
      //     sessionAge: this.REFRESH_TOKEN_AGE,
      //   });

      //   const refreshTokenData: IRefreshJwtPayload = {
      //     session_id: session._id,
      //     expired: this.REFRESH_TOKEN_AGE,
      //     create_at: new Date().toString(),
      //   };

      //   const accessTokenData: IAccessJwtPayload = {
      //     _id: member._id,
      //     name: member.name,
      //     email: member.email,
      //     image: member.image,
      //     role_author: member.role_author,
      //     role_comment: member.role_comment,
      //     role_owner: member.role_owner,
      //     expired: this.ACCESS_TOKEN_AGE,
      //     session_id: session._id,
      //     create_at: new Date().toString(),
      //   };

      //   const accessToken = await this.jwtService.sign(accessTokenData, {
      //     secret: process.env.ACCESS_TOKEN_SECRET,
      //   });

      //   const refreshToken = await this.jwtService.sign(refreshTokenData, {
      //     secret: process.env.REFRESH_TOKEN_SECRET,
      //   });

      //   res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
      //     maxAge: this.ACCESS_TOKEN_AGE,
      //     httpOnly: false,
      //   });

      //   res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      //     maxAge: this.REFRESH_TOKEN_AGE,
      //     httpOnly: false,
      //   });

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }
}
