import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  @Get()
  @ApiTags('comment')
  async comments() {
    return '';
  }

  @Get(':comment')
  @ApiTags('comment')
  async replys() {
    return '';
  }

  @Post()
  @ApiTags('comment')
  async createComment() {
    return '';
  }

  @Post(':comment')
  @ApiTags('comment')
  async createReply() {
    return '';
  }

  @Delete()
  @ApiTags('comment')
  async deleteComment() {
    return '';
  }
}
