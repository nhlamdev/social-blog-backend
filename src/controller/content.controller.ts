import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('content')
export class ContentController {
  @Get()
  @ApiTags('content')
  async contents() {}

  @Post()
  @ApiTags('content')
  async createContent() {}

  @Put(':id')
  @ApiTags('content')
  async updateContent() {}

  @Delete(':id')
  @ApiTags('content')
  async removeContent() {}
}
