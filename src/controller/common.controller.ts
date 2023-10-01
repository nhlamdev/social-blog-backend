import { CommonService } from '@/service';
import { Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('statistical')
  @ApiTags('common')
  async statistical() {
    return 'test';
  }

  @Get('global')
  @ApiTags('common')
  async global() {
    return 'test';
  }

  @Get('member-action')
  @ApiTags('common')
  async memberAction() {
    return 'test';
  }

  @Get('setting-action')
  @ApiTags('common')
  async setting() {
    return 'test';
  }

  @Put('update-setting-action')
  @ApiTags('common')
  async settingUpdate() {
    return 'test';
  }
}
