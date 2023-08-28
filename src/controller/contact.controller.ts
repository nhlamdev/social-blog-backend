import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('contact')
export class ContactController {
  @Get()
  @ApiTags('contact')
  async contacts() {}

  @Post()
  @ApiTags('contact')
  async createContacts() {}

  @Delete()
  @ApiTags('contact')
  async removeContact() {}
}
