import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('common')
export class CommonController {
  @Get()
  @ApiTags('common')
  async memberOnline() {
    return 'test';
  }

  // @Get()
  // async status() {}

  @Post()
  @ApiTags('upload')
  async upload(@Body() body) {
    return body;
  }
}
