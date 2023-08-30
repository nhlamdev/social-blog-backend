import { AccessJwtPayload, RefreshJwtPayload } from '@/interface';
import { OwnerLoginDto } from '@/model';
import { AuthService } from '@/service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class AuthController {
  private readonly ownerAccount = process.env.OWNER_ACCOUNT;
  private readonly ownerPassword = process.env.OWNER_PASSWORD;

  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('google')
  @ApiTags('auth')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiTags('auth')
  async googleLoginCallback(@Req() req, @Res() res) {
    const { user } = req;

    if (user) {
      const member = await this.authService.socialVerifyExist(user);

      const accessToken = await this.jwtService.sign(
        {
          _id: member._id,
          provider_id: member.provider_id,
          provider: member.provider,
          role: 'member',
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
        },
      );

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
      });

      const refreshToken = await this.jwtService.sign(
        { session_id: session._id, role: 'member' },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  // @Get('facebook')
  // @UseGuards(AuthGuard('facebook'))
  // @ApiTags('auth')
  // async facebookLogin() {}

  // @Get('facebook/callback')
  // @UseGuards(AuthGuard('facebook'))
  // @ApiTags('auth')
  // async facebookLoginCallback(@Req() req) {
  //   return req.user;
  // }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiTags('auth')
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiTags('auth')
  async githubLoginCallback(@Req() req, @Res() res) {
    const { user } = req;

    if (user) {
      const member = await this.authService.socialVerifyExist(user);

      const accessToken = await this.jwtService.sign(
        {
          _id: member._id,
          provider_id: member.provider_id,
          provider: member.provider,
          role: 'member',
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
        },
      );

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
      });

      const refreshToken = await this.jwtService.sign(
        { session_id: session._id, role: 'member' },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  @ApiTags('auth')
  async discordLogin() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  @ApiTags('auth')
  async discordLoginCallback(@Req() req, @Res() res) {
    const { user } = req;

    if (user) {
      const member = await this.authService.socialVerifyExist(user);

      const accessToken = await this.jwtService.sign(
        {
          _id: member._id,
          provider_id: member.provider_id,
          provider: member.provider,
          role: 'member',
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
        },
      );

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
      });

      const refreshToken = await this.jwtService.sign(
        { session_id: session._id, role: 'member' },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('client-profile-all')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-access'))
  async clientProfile() {
    return await this.authService.allMember();
  }

  @Get('profile')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-access'))
  async clientProfileById(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (jwtPayload.role === 'member') {
      const member = await this.authService.memberById(jwtPayload._id);

      if (Boolean(member)) {
        return { ...member, role: 'member' };
      } else {
        throw new UnauthorizedException('Member not found.!');
      }
    } else {
      const result = { name: 'quản trị viên', role: 'owner' };
      return result;
    }
  }

  @Get('all-members')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-access'))
  async allMembers() {
    return await this.authService.allMember();
  }

  @Get('renew-token')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req, @Res() res) {
    const jwtPayload: RefreshJwtPayload = req.user;

    const session = await this.authService.sessionById(jwtPayload.session_id);

    if (Boolean(session)) {
      if (jwtPayload.role === 'member') {
        if (session.member) {
          const accessToken = await this.jwtService.sign(
            {
              _id: session.member._id,
              provider_id: session.member.provider_id,
              provider: session.member.provider,
              role: 'member',
            },
            {
              secret: process.env.ACCESS_TOKEN_SECRET,
            },
          );

          res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
            maxAge: 3600000,
            httpOnly: true,
          });

          res.status(200).json({ message: 'renew success' });
        } else {
          throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
        }
      } else {
        const accessToken = await this.jwtService.sign(
          {
            role: 'owner',
          },
          {
            secret: process.env.ACCESS_TOKEN_SECRET,
          },
        );

        res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
          maxAge: 3600000,
          httpOnly: true,
        });
        res.status(200).json({ message: 'renew success' });
      }
    } else {
      throw new UnauthorizedException('Phiên đăng nhập quá hạn.');
    }
  }

  @Post('owner-login')
  @ApiTags('auth')
  async ownerLogin(@Req() req, @Res() res, @Body() body: OwnerLoginDto) {
    if (body.account && body.password) {
      const accessToken = await this.jwtService.sign(
        {
          role: 'owner',
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
        },
      );

      const session = await this.authService.createSession({
        client: req.client_data,
        role: 'owner',
      });

      const refreshToken = await this.jwtService.sign(
        { session_id: session._id, role: 'owner' },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: 3600000,
        httpOnly: true,
      });
      res.status(200).json({ message: 'success' });
    } else {
      throw new BadRequestException('Mật khẩu hoặc tài khoản không ');
    }

    return '';
  }

  @Post('logout')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  async clientLogout(@Req() req, @Res() res) {
    const jwtPayload: RefreshJwtPayload = req.user;

    const { session_id } = jwtPayload;

    this.authService.removeSession(session_id);

    res.cookie(process.env.ACCESS_TOKEN_NAME, '', {
      maxAge: 0,
      httpOnly: true,
    });

    res.cookie(process.env.REFRESH_TOKEN_NAME, '', {
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({ message: 'logout success !.' });
  }

  @Post('logout-all')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  async clientLogoutAll(@Res() res) {
    res.cookie(process.env.ACCESS_TOKEN_NAME, '', {
      maxAge: 0,
      httpOnly: true,
    });

    res.cookie(process.env.REFRESH_TOKEN_NAME, '', {
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({ message: 'logout success !.' });
  }
}
