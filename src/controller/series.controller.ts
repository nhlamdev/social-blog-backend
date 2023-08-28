import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('series')
export class SeriesController {
  @Get()
  @ApiTags('series')
  async categories() {}

  @Post()
  @ApiTags('series')
  async createCategory() {}

  @Put(':id')
  @ApiTags('series')
  async updateCategory() {}

  @Delete(':id')
  @ApiTags('series')
  async removeCategory() {}
}
