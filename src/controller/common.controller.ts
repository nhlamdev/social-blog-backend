import { CommonService } from '@/service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
