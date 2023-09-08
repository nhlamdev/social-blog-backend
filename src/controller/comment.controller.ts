import { CommentService } from '@/service';
import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':content')
  @ApiTags('comment')
  async comments() {
    return this;
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
