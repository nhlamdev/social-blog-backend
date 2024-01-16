import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { MemberService } from '../member/member.service';
import { SessionService } from './session.service';
import { TokenService } from '@/auth/token/token.service';

@Controller('session')
@ApiTags('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly memberService: MemberService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt-access'))
  async session(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('member') member: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn.');
    }

    const _member = await this.memberService.exist({ where: { _id: member } });

    if (!_member) {
      throw new ForbiddenException('thành viên cần tìm không tồn tại.');
    }
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const { result: sessions, count } =
      await this.sessionService.findAllAndCount({
        skip: _skip,
        take: _take,
        where: { created_by: { _id: member } },
        relations: { created_by: true },
        order: { created_by: 'DESC' },
      });

    return { sessions, count };
  }

  @Get('by-member')
  @UseGuards(AuthGuard('jwt-access'))
  async byTargetId(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const { result: sessions, count } =
      await this.sessionService.findAllAndCount({
        skip: _skip,
        take: _take,
        where: { created_by: { _id: jwtPayload._id } },
        relations: { created_by: true },
        order: { created_at: 'DESC' },
      });

    return { sessions, count };
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard('jwt-access'))
  async byMember(@Req() req, @Param('skip') id: MaybeType<string>) {
    const jwtPayload: IAccessJwtPayload = req.user;
    const session = await this.sessionService.findOne({
      where: { _id: id },
      relations: { created_by: true },
    });

    if (!jwtPayload.role.owner && session.created_by._id === jwtPayload._id) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác');
    }

    return session;
  }

  @Delete('force/:session')
  @UseGuards(AuthGuard('jwt-access'))
  async remove(@Req() req, @Param('session') session: MaybeType<string>) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _session = await this.sessionService.findOne({
      where: { _id: session },
      relations: { created_by: true },
    });

    if (!_session) {
      throw new ForbiddenException('Phiên không tồn tại');
    }

    if (jwtPayload.role.owner && _session.created_by._id === jwtPayload._id) {
      await this.sessionService.delete(session);
      await this.tokenService.removeRefreshTokenByKeyAndMember({
        key: _session.token_key,
        member_id: _session.created_by._id,
      });
    }
  }

  @Delete('logout')
  @UseGuards(AuthGuard('jwt-access'))
  async login(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const token = await this.tokenService.findRefreshTokenInCache({
      key: jwtPayload.token_refresh_key,
      member_id: jwtPayload._id,
    });

    if (!Boolean(token)) {
      throw new BadRequestException('Phiên đăng nhập không hợp lệ.');
    }

    await this.tokenService.removeRefreshTokenByKeyAndMember({
      key: token.key,
      member_id: token.member_id,
    });

    await this.sessionService.delete(token.session_id);

    return { message: 'logout success' };
  }
}
