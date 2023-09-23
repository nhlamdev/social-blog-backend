import { AccessJwtPayload, RefreshJwtPayload } from '@/interface';
import { AuthService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import {
  Controller,
  Delete,
  Get,
  Query,
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

      const accessAge = 1000 * 60 * 5;

      const accessTokenData: AccessJwtPayload = {
        _id: member._id,
        name: member.name,
        email: member.email,
        image: member.image,
        role: member.role,
        expired: accessAge,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
        provider: user.provider,
      });

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: accessAge,
        httpOnly: true,
      });

      const refreshAge = 1000 * 60 * 60 * 24 * 30 * 6;

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: refreshAge,
        create_at: new Date().toString(),
      };

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: refreshAge,
        httpOnly: true,
      });

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

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

      const accessAge = 1000 * 60 * 5;

      const accessTokenData: AccessJwtPayload = {
        _id: member._id,
        name: member.name,
        email: member.email,
        image: member.image,
        role: member.role,
        expired: accessAge,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
        provider: user.provider,
      });

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: accessAge,
        httpOnly: true,
      });

      const refreshAge = 1000 * 60 * 60 * 24 * 30 * 6;

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: refreshAge,
        create_at: new Date().toString(),
      };

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: refreshAge,
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

      const accessAge = 1000 * 60 * 5;

      const accessTokenData: AccessJwtPayload = {
        _id: member._id,
        name: member.name,
        email: member.email,
        image: member.image,
        role: member.role,
        expired: accessAge,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
        provider: user.provider,
      });

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: accessAge,
        httpOnly: true,
      });

      const refreshAge = 1000 * 60 * 60 * 24 * 30 * 6;

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: refreshAge,
        create_at: new Date().toString(),
      };

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: refreshAge,
        httpOnly: true,
      });

      res.redirect('/');
    } else {
      res.redirect('/');
    }
  }

  @Get('profile')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-access'))
  async clientProfileById(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new UnauthorizedException('Thành viên không tồn tại!');
    }

    return member;
  }

  @Get('all-members')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-access'))
  async allMembers(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.authService.allMember(_take, _skip, _search);
  }

  @Get('renew-token')
  @ApiTags('auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req, @Res() res) {
    const jwtPayload: RefreshJwtPayload = req.user;

    const session = await this.authService.sessionById(jwtPayload.session_id);

    if (!Boolean(session)) {
      throw new UnauthorizedException('Phiên đăng nhập không tồn tại.');
    }

    if (session.member) {
      throw new UnauthorizedException('Thành viên không tồn tại.');
    }

    const accessAge = 1000 * 60 * 5;

    const accessTokenData: AccessJwtPayload = {
      _id: session.member._id,
      name: session.member.name,
      email: session.member.email,
      image: session.member.image,
      role: session.member.role,
      expired: accessAge,
      create_at: new Date().toString(),
    };

    const accessToken = await this.jwtService.sign(accessTokenData, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
      maxAge: 3600000,
      httpOnly: true,
    });

    res.status(200).json({ message: 'renew success' });
  }

  @Delete('logout')
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

  @Delete('logout-all')
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
