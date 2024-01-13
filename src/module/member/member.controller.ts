import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Like } from 'typeorm';
import { MemberUpdateDto, MemberUpdateRoleDto } from './member.dto';
import { MemberService } from './member.service';

@ApiTags('member')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt-access'))
  async profile(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    delete jwtPayload.expired;
    delete jwtPayload.token_refresh_key;
    delete jwtPayload.token_created_at;
    delete jwtPayload.exp;
    delete jwtPayload.iat;

    return jwtPayload;
  }

  @Get()
  async authors(
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const { result: members, count } = await this.memberService.findAllAndCount(
      {
        skip: _skip,
        take: _take,
        where: {
          name: Like(_search),
        },
      },
    );

    return { members, count };
  }

  @Get('owner')
  @UseGuards(AuthGuard('jwt-access'))
  async members(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác');
    }

    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const { result: members, count } = await this.memberService.findAllAndCount(
      {
        skip: _skip,
        take: _take,
        where: {
          name: Like(_search),
        },
      },
    );

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

  @Patch('change-role/:member')
  @UseGuards(AuthGuard('jwt-access'))
  async changeRole(
    @Req() req,
    @Body() body: MemberUpdateRoleDto,
    @Param('member') member: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    const exist = await this.memberService.findOne({ where: { _id: member } });

    if (!exist) {
      throw new BadRequestException('Thành viên không tồn tại.');
    }

    await this.memberService.update(member, {
      role_author: body.author,
      role_comment: body.comment,
    });
  }

  @Patch('change-follow/:author')
  @UseGuards(AuthGuard('jwt-access'))
  async changeFollower(@Req() req, @Param('author') author: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _author = await this.memberService.findOne({
      where: { _id: author },
    });

    if (_author.follow_by.includes(jwtPayload._id)) {
      _author.follow_by = _author.follow_by.filter((v) => {
        v !== jwtPayload._id;
      });
    } else {
      _author.follow_by.push(jwtPayload._id);
    }

    return await this.memberService.update(author, _author);
  }
}
