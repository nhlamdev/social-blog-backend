import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RedisClientType } from 'redis';
import { Like } from 'typeorm';
import { MemberUpdateDto, MemberUpdateRoleDto } from './member.dto';
import { MemberService } from './member.service';

@ApiTags('member')
@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt-access'))
  async profile(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    delete jwtPayload.expired;
    delete jwtPayload.refresh_token;
    delete jwtPayload.token_created_at;

    return jwtPayload;
  }

  @Get()
  async members(
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [members, count] = await this.memberService.findAllAndCount({
      skip: _skip,
      take: _take,
      where: {
        name: Like(`%${_search}%`),
      },
    });

    return { members, count };
  }

  @Get('by-id/:id')
  async author(@Param('id') id: string) {
    const member = await this.memberService.findOne({ where: { _id: id } });
    return member;
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Req() req, @Body() body: MemberUpdateDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    await this.memberService.update(jwtPayload._id, {
      name: body.name,
      image: body.image,
    });
  }

  @Put('change-role')
  @UseGuards(AuthGuard('jwt-access'))
  async changeRole(@Req() req, @Body() body: MemberUpdateRoleDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    await this.memberService.update(body.id, {
      role_author: body.author,
      role_comment: body.comment,
    });
  }
}
