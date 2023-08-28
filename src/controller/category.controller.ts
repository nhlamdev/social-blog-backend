import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  @Get()
  @ApiTags('category')
  async categories() {}

  @Post()
  @ApiTags('category')
  async createCategory() {}

  @Put(':id')
  @ApiTags('category')
  async updateCategory() {}

  @Delete(':id')
  @ApiTags('category')
  async removeCategory() {}
}
