import { AccessJwtPayload, RefreshJwtPayload } from '@/interface';
import { ProfileDto } from '@/model';
import { AuthService, CommonService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { diskStorage } from 'multer';

@Controller()
export class AuthController {
  private readonly ACCESS_TOKEN_NAME = process.env.ACCESS_TOKEN_NAME;
  private readonly REFRESH_TOKEN_NAME = process.env.REFRESH_TOKEN_NAME;

  private readonly ACCESS_TOKEN_AGE = 1000 * 60;
  private readonly REFRESH_TOKEN_AGE = 1000 * 60 * 60 * 24 * 30 * 6;

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
        provider: user.provider,
        provider_id: user.id,
        sessionAge: this.REFRESH_TOKEN_AGE,
      });

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: this.REFRESH_TOKEN_AGE,
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
        expired: this.ACCESS_TOKEN_AGE,
        session_id: session._id,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: this.ACCESS_TOKEN_AGE,
        httpOnly: false,
      });

      res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: this.REFRESH_TOKEN_AGE,
        httpOnly: false,
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

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
        provider: user.provider,
        provider_id: user.id,
        sessionAge: this.REFRESH_TOKEN_AGE,
      });

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: this.REFRESH_TOKEN_AGE,
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
        expired: this.ACCESS_TOKEN_AGE,
        session_id: session._id,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: this.ACCESS_TOKEN_AGE,
        httpOnly: false,
      });

      res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: this.REFRESH_TOKEN_AGE,
        httpOnly: false,
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

      const session = await this.authService.createSession({
        client: req.client_data,
        member,
        provider: user.provider,
        provider_id: user.id,
        sessionAge: this.REFRESH_TOKEN_AGE,
      });

      const refreshTokenData: RefreshJwtPayload = {
        session_id: session._id,
        expired: this.REFRESH_TOKEN_AGE,
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
        expired: this.ACCESS_TOKEN_AGE,
        session_id: session._id,
        create_at: new Date().toString(),
      };

      const accessToken = await this.jwtService.sign(accessTokenData, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const refreshToken = await this.jwtService.sign(refreshTokenData, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
        maxAge: this.ACCESS_TOKEN_AGE,
        httpOnly: false,
      });

      res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: this.REFRESH_TOKEN_AGE,
        httpOnly: false,
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
  async profile(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    return jwtPayload;
  }

  @Put('change')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, next) => {
          next(null, 'uploads');
        },
        filename: (req, file, next) => {
          next(
            null,
            new Date().toISOString().replace(/:/g, '-') +
              '-' +
              file.originalname,
          );
        },
      }),
    }),
  )
  async updateProfile(
    @UploadedFile('files') files: Express.Multer.File,
    @Req() req,
    @Body() body: ProfileDto,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const filesData = await this.commonService.saveFile(files);

    if (!body.name && filesData.length === 0) {
      throw new BadRequestException('Dữ liệu không thay đổi.');
    }

    return await this.authService.updateProfile({
      id: jwtPayload._id,
      image: filesData.length !== 0 ? filesData[0].fileName : undefined,
      name: body.name ? body.name : undefined,
    });
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

    const member = await this.authService.oneMemberById(jwtPayload._id);

    if (!member.role_owner) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const { data: membersWitdthRole, count } =
      await this.authService.manyMemberWidthCountContent(_take, _skip, _search);

    const result = { data: membersWitdthRole, count };

    return result;
  }

  @Get('all-session')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  async allSession(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const sessions = await this.authService.manySessionByMemberId(
      jwtPayload._id,
    );

    return Promise.all(
      sessions.map((v) => {
        const result = { ...v, isCurrent: v._id === jwtPayload.session_id };
        return result;
      }),
    );
  }

  @Get('author/:id')
  @ApiTags('member-auth')
  @ApiOperation({
    summary: 'Lấy thông tin tất cả thành viên (owner).',
  })
  async authorById(@Param('id') id: string) {
    const member = await this.authService.oneMemberById(id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại.');
    }

    return member;
  }

  @Get('renew-token')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({
    summary: 'Làm mới access token.',
  })
  async refreshToken(@Req() req, @Res() res) {
    const jwtPayload: RefreshJwtPayload = req.user;

    const session = await this.authService.oneSessionById(
      jwtPayload.session_id,
    );

    if (!Boolean(session)) {
      throw new BadRequestException('Phiên đăng nhập không tồn tại.');
    }

    if (!session.member) {
      throw new BadRequestException('Thành viên không tồn tại.');
    }

    const accessAge = 1000 * 60 * 5;

    const accessTokenData: AccessJwtPayload = {
      _id: session.member._id,
      name: session.member.name,
      email: session.member.email,
      image: session.member.image,
      session_id: session._id,
      role_author: session.member.role_author,
      role_comment: session.member.role_comment,
      role_owner: session.member.role_owner,
      expired: accessAge,
      create_at: new Date().toString(),
    };

    const accessToken = await this.jwtService.sign(accessTokenData, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    res.cookie(this.ACCESS_TOKEN_NAME, accessToken, {
      maxAge: this.ACCESS_TOKEN_AGE,
      httpOnly: false,
    });

    res.status(200).json({ message: 'renew success' });
  }

  @Patch('change-role/:memberId')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  async updateRoleMember(
    @Param('memberId') memberId: string,
    @Body() payload: { key: string; value: boolean },
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new BadRequestException('Quyền không hợp lệ.');
    }
    if (!['comment', 'author', 'owner'].includes(payload.key)) {
      throw new BadRequestException('Quyền không hợp lệ');
    }
    if (typeof payload.value !== 'boolean') {
      throw new BadRequestException('Loại không hợp lệ');
    }

    const memberUpdate = await this.authService.oneMemberById(memberId);

    if (payload.key === 'author') {
      memberUpdate.role_author = payload.value;
    }

    if (payload.key === 'comment') {
      memberUpdate.role_comment = payload.value;
    }

    if (payload.key === 'owner') {
      memberUpdate.role_owner = payload.value;
    }
    // console.log(memberUpdate);
    // console.log('memberUpdate : ', memberUpdate);

    return await this.authService.updateRole(memberUpdate);
  }

  @Delete('logout')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Đăng xuất phiên hiện tại.',
  })
  async clientLogout(@Req() req, @Res() res) {
    const jwtPayload: AccessJwtPayload = req.user;

    this.authService.removeSession(jwtPayload.session_id);

    res.cookie(process.env.ACCESS_TOKEN_NAME, '', {
      maxAge: 0,
      httpOnly: false,
    });

    res.cookie(process.env.REFRESH_TOKEN_NAME, '', {
      maxAge: 0,
      httpOnly: false,
    });

    res.status(200).json({ message: 'logout success !.' });
  }

  @Delete('logout-target/:id')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Đăng xuất phiên theo chỉ định.',
  })
  async clientTargetLogout(@Req() req, @Param('id') sessionTargetId: string) {
    const jwtPayload: AccessJwtPayload = req.user;

    const sessionTarget = await this.authService.checkSessionExistByMember(
      sessionTargetId,
      jwtPayload._id,
    );

    if (!sessionTarget) {
      throw new BadRequestException('Phiên đăng nhập không tồn tại.');
    }

    return this.authService.removeSession(sessionTargetId);
  }

  @Delete('logout-all')
  @ApiTags('member-auth')
  @ApiOperation({
    summary: 'Đăng xuất tất cả các phiên của người dùng.',
  })
  @UseGuards(AuthGuard('jwt-access'))
  async clientLogoutAll(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const sessionTarget = await this.authService.checkSessionExist(
      jwtPayload.session_id,
    );

    if (!sessionTarget) {
      throw new BadRequestException('Phiên đăng nhập không tồn tại.');
    }

    this.authService.removeSessionAnother(jwtPayload.session_id);
  }
}
