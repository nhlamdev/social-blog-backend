import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('contact')
@ApiTags('contact')
export class ContactController {
  @Get()
  async contacts() {}

  @Post(':id')
  async create() {}

  @Delete(':id')
  async delete() {}
}
