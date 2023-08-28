import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('series')
export class SeriesController {
  @Get()
  @ApiTags('series')
  async series() {}

  @Post()
  @ApiTags('series')
  async createSeries() {}

  @Put(':id')
  @ApiTags('series')
  async updateSeries() {}

  @Delete(':id')
  @ApiTags('series')
  async removeSeries() {}
}
