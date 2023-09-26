import { CommonService } from '@/service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get()
  @ApiTags('common')
  async memberOnline() {
    return 'test';
  }
}
