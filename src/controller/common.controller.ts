import { CommonService } from '@/service';
import { Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('personal-statistical')
  @ApiTags('common')
  @ApiOperation({
    summary: 'personal statistical',
  })
  async statistical() {
    return 'test';
  }

  @Get('global-statistical')
  @ApiOperation({
    summary: 'global statistical (owner)',
  })
  @ApiTags('common')
  async global() {
    return 'test';
  }

  @Get('member-action')
  // @ApiOkResponse({
  //   description: 'test',
  //   schema: {
  //     allOf:{},
  //   },
  // })
  @ApiTags('common')
  memberAction(): string {
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
