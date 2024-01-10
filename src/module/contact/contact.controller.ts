import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactDto } from './contact.dto';
import { AuthGuard } from '@nestjs/passport';
import { IAccessJwtPayload } from '@/shared/types';
import { ContactService } from './contact.service';
import { MemberService } from '../member/member.service';
import { PaginationDto } from '@/shared/dto/paginate.dto';
import { ILike } from 'typeorm';

@Controller('contact')
@ApiTags('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly memberService: MemberService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt-access'))
  async contacts(@Req() req, @Query() query: PaginationDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    const { result, count } = await this.contactService.findAllAndCount({
      where: { title: ILike(query.search) },
      take: query.take,
      skip: query.skip,
    });

    return { contacts: result, count };
  }

  @Post()
  @UseGuards(AuthGuard('jwt-access'))
  async create(@Req() req, @Body() body: ContactDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const member = await this.memberService.findOne({
      where: { _id: jwtPayload._id },
    });

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại');
    }

    return await this.contactService.create({
      title: body.title,
      description: body.description,
      created_by: member,
    });
  }

  @Delete(':contact')
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Req() req, @Param('member') contact: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    return await this.contactService.delete(contact);
  }
}
