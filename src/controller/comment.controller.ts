import { AccessJwtPayload } from '@/interface';
import { CommentCreteDto } from '@/model';
import { AuthService, CommentService, ContentService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import {
  BadRequestException,
  ForbiddenException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly contentService: ContentService,
    private readonly authService: AuthService,
  ) {}

  @Get('by-content/:id')
  @ApiTags('comment')
  async commentsByContent(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const content = await this.contentService.getContentById(id);
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    return await this.commentService.commentByContent(content, _take, _skip);
  }

  @Get('by-parent/:id')
  @ApiTags('comment')
  async commentByParent(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const parent = await this.commentService.commentById(id);
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    if (!Boolean(parent)) {
      throw new BadRequestException('bình luận mà bạn trả lời không tồn tại.');
    }

    return await this.commentService.commentByParent(parent, _take, _skip);
  }

  @Post('by-content/:id')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('comment')
  async createComment(
    @Req() req,
    @Body() body: CommentCreteDto,
    @Param('id') id: string,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const content = await this.contentService.getContentById(id);

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    if (jwtPayload.role === 'member') {
      const member = await this.authService.memberById(jwtPayload._id);

      this.commentService.createComment({
        text: body.text,
        member: member,
        content: content,
      });
    }

    if (jwtPayload.role === 'owner') {
      this.commentService.createComment({
        text: body.text,
        content: content,
      });
    }
  }

  @Post('by-parent/:id')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('comment')
  async createReply(
    @Req() req,
    @Body() body: CommentCreteDto,
    @Param('id') id: string,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const parent = await this.commentService.commentById(id);

    if (!Boolean(parent)) {
      throw new BadRequestException('bình luận mà bạn trả lời không tồn tại.');
    }

    if (jwtPayload.role === 'member') {
      const member = await this.authService.memberById(jwtPayload._id);

      this.commentService.createComment({
        text: body.text,
        member: member,
        parent: parent,
      });
    }

    if (jwtPayload.role === 'owner') {
      this.commentService.createComment({
        text: body.text,
        parent: parent,
      });
    }
  }

  @Delete(':id')
  @ApiTags('comment')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteComment(@Param('id') id: string, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const comment = await this.commentService.commentById(id);

    if (!Boolean(comment)) {
      throw new BadRequestException('Bình luận bạn muốn xoá không tồn tại.');
    }

    if (comment.created_by) {
      if (
        jwtPayload.role === 'member' &&
        comment.created_by._id === jwtPayload._id
      ) {
        return this.commentService.removeComment(comment);
      }
    }

    if (jwtPayload.role === 'owner') {
      return this.commentService.removeComment(comment);
    }

    throw new ForbiddenException('Bạn không có quyền xoá bình luận này.');
  }
}
