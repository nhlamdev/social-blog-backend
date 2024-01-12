import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
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
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { ContentService } from '../content/content.service';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import { CommentCreteDto } from './comment.dto';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly commentService: CommentService,
    private readonly memberService: MemberService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('by-content/:content')
  async commentsByContent(
    @Param('content') content: string,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;

    const [comments, count] = await this.commentService.findAllAndCount({
      where: { content: { _id: content } },
      skip: _skip,
      take: _take,
      relations: { content: true, created_by: true },
    });

    return { comments, count };
  }

  @Get('by-parent/:parent')
  async commentByParent(
    @Param('parent') parent: string,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;

    const [comments, count] = await this.commentService.findAllAndCount({
      where: { comment_parent: { _id: parent } },
      skip: _skip,
      take: _take,
      relations: { comment_parent: true, created_by: true },
    });

    return { comments, count };
  }

  @Post('by-content/:content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('comment')
  async createComment(
    @Req() req,
    @Body() body: CommentCreteDto,
    @Param('content') content: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _member = await this.memberService.findOne({
      where: { _id: jwtPayload._id },
    });

    const _content = await this.contentService.findOne({
      where: { _id: content },
      relations: { created_by: true },
    });

    if (!jwtPayload.role.comment) {
      throw new ForbiddenException('Bạn không có quyền thao tác.');
    }

    if (!_content || !_member) {
      throw new BadRequestException('Dữ liệu không đầy đủ.');
    }

    this.notificationService.create({
      from: jwtPayload._id,
      to: _content.created_by._id,
      title: 'vừa bình luận bài viết của bạn',
      url: `/content/${_content._id}`,
    });

    return await this.commentService.create({
      text: body.text,
      member: _member,
      content: _content,
    });
  }

  @Post('by-parent/:parent')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('comment')
  async createReply(
    @Req() req,
    @Body() body: CommentCreteDto,
    @Param('parent') parent: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _member = await this.memberService.findOne({
      where: { _id: jwtPayload._id },
    });

    const _parent = await this.commentService.findOne({
      where: { _id: parent },
      relations: { content: true, created_by: true },
    });

    if (!jwtPayload.role.comment) {
      throw new ForbiddenException('Bạn không có quyền thao tác.');
    }

    if (!_parent || !_member) {
      throw new BadRequestException('Dữ liệu không đầy đủ.');
    }

    this.notificationService.create({
      from: jwtPayload._id,
      to: _parent.created_by._id,
      title: 'vừa bình luận bài viết của bạn',
      url: `/content/${_parent.content._id}`,
    });

    return await this.commentService.create({
      text: body.text,
      member: _member,
      parent: _parent,
    });
  }

  @Delete(':comment')
  @ApiTags('comment')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteComment(@Param('comment') comment: string, @Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _comment = await this.commentService.findOne({
      where: { _id: comment },
    });

    if (!Boolean(comment)) {
      throw new BadRequestException('Bình luận bạn muốn xoá không tồn tại.');
    }

    if (_comment.created_by._id !== jwtPayload._id && !jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền xoá bình luận này!');
    }

    return await this.commentService.delete(_comment._id);
  }
}
