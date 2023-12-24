import { AccessJwtPayload } from '@/interface';
import { CommentCreteDto } from '@/model';
import { AuthService, CommentService, ContentService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
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
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const isExistContent = await this.contentService.checkExistById(id);

    if (!isExistContent) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    const content = await this.contentService.oneContentById(id);

    return await this.commentService.commentByContent(content, _take, _skip);
  }

  @Get('by-parent/:id')
  @ApiTags('comment')
  async commentByParent(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const isExistParent = await this.commentService.checkExistById(id);

    if (!isExistParent) {
      throw new BadRequestException('bình luận mà bạn trả lời không tồn tại.');
    }

    const parent = await this.commentService.commentById(id);

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

    const member = await this.authService.oneMemberById(jwtPayload._id);

    const isExistContent = await this.contentService.checkExistById(id);

    if (!isExistContent) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }

    const content = await this.contentService.oneContentById(id);

    return await this.commentService.createComment({
      text: body.text,
      member: member,
      content: content,
    });
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

    const member = await this.authService.oneMemberById(jwtPayload._id);

    const parent = await this.commentService.commentById(id);

    if (!Boolean(parent)) {
      throw new BadRequestException('bình luận mà bạn trả lời không tồn tại.');
    }

    return await this.commentService.createComment({
      text: body.text,
      member: member,
      parent: parent,
    });
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

    if (comment.created_by._id !== jwtPayload._id && !jwtPayload.role_owner) {
      throw new ForbiddenException('Bạn không có quyền xoá bình luận này!');
    }

    return await this.commentService.removeComment(comment);
  }
}
