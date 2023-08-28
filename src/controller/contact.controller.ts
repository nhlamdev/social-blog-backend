import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('contact')
export class ContactController {
  @Get()
  @ApiTags('contact')
  async contacts() {}

  @Get()
  @ApiTags('contact')
  async createContacts() {}
}
