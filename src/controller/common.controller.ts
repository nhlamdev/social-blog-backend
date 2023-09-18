import { Controller, Get } from '@nestjs/common';

@Controller('common')
export class CommonController {
  @Get()
  async memberOnline() {}

  @Get()
  async status() {}
}
