import { CommonService, RedisService } from '@/service';
import { Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly redisService: RedisService,
  ) {}

  @Get('visualize')
  @ApiTags('common')
  async visualize() {
    return this.commonService.ownerVisualizeData();
  }

  @Get('current-memory-use')
  @ApiTags('common')
  async global() {
    return this.commonService.checkMemoryUse();
  }

  // @Get('test')
  // @ApiTags('common')
  // async test() {
  //   const value = await this.redisSerivce.GET('test');
  //   const value2 = await this.redisSerivce.GET('test2');

  //   console.log('value2 : ', Boolean(value2));

  //   return value;
  // }

  // @Get('test/up')
  // @ApiTags('common')
  // async up() {
  //   const value = await this.redisSerivce.GET('test');
  //   console.log('value : ', typeof value, ' ', value);

  //   await this.redisSerivce.SET('test', Number(value) + 1);
  // }

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
