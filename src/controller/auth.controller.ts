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
  ForbiddenException,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

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
        provider_id: user.id,
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
        provider_id: user.id,
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
        provider_id: user.id,
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

  // ---------------------------------------------

  @Get('profile')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân.',
  })
  async clientProfileById(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new UnauthorizedException('Thành viên không tồn tại!');
    }

    return member;
  }

  @Get('all-members')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin tất cả thành viên (owner).',
  })
  async allMembers(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;
    const member = await this.authService.memberById(jwtPayload._id);

    if (member.role !== 'owner') {
      throw new ForbiddenException('Bạn không có quyền hạn!.');
    }

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
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({
    summary: 'Làm mới access token.',
  })
  async refreshToken(@Req() req, @Res() res) {
    const jwtPayload: RefreshJwtPayload = req.user;

    const session = await this.authService.sessionById(jwtPayload.session_id);

    if (!Boolean(session)) {
      throw new UnauthorizedException('Phiên đăng nhập không tồn tại.');
    }

    if (!session.member) {
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
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({
    summary: 'Đăng xuất phiên hiện tại.',
  })
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

  @Delete('logout-target/:id')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Đăng xuất phiên theo chỉ định.',
  })
  async clientTargetLogout(@Req() req, @Param('id') id: string) {
    const jwtPayload: AccessJwtPayload = req.user;

    const sessionTarget = await this.authService.sessionById(id);

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện thao tác này.',
      );
    }

    if (!Boolean(sessionTarget)) {
      throw new BadRequestException('Phiên đăng nhập không tồn tại.');
    }

    if (sessionTarget.member._id === member._id || member.role === 'owner') {
      return await this.authService.removeSession(sessionTarget._id);
    } else {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện thao tác này.',
      );
    }
  }

  @Delete('logout-all')
  @ApiTags('member-auth')
  @ApiOperation({
    summary: 'Đăng xuất tất cả các phiên của người dùng.',
  })
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
