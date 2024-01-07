import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  @Get('by-content/:id')
  async commentsByContent(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
  }

  @Get('by-parent/:id')
  async commentByParent(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
  }

  @Post('by-content/:id')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('comment')
  async createComment(
    @Req() req,
    // @Body() body: CommentCreteDto,
    @Param('id') id: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;
  }

  @Post('by-parent/:id')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('comment')
  async createReply(
    @Req() req,
    // @Body() body: CommentCreteDto,
    @Param('id') id: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    // const member = await this.authService.oneMemberById(jwtPayload._id);

    // const parent = await this.commentService.commentById(id);

    // if (!Boolean(parent)) {
    //   throw new BadRequestException('bình luận mà bạn trả lời không tồn tại.');
    // }

    // return await this.commentService.createComment({
    //   text: body.text,
    //   member: member,
    //   parent: parent,
    // });
  }

  @Delete(':id')
  @ApiTags('comment')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteComment(@Param('id') id: string, @Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    // const comment = await this.commentService.commentById(id);

    // if (!Boolean(comment)) {
    //   throw new BadRequestException('Bình luận bạn muốn xoá không tồn tại.');
    // }

    // if (comment.created_by._id !== jwtPayload._id && !jwtPayload.role_owner) {
    //   throw new ForbiddenException('Bạn không có quyền xoá bình luận này!');
    // }

    // return await this.commentService.removeComment(comment);
  }
}
