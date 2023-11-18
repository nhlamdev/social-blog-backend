import { CommonService } from '@/service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import { Ctx, RmqContext } from '@nestjs/microservices';
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

  @Get('test')
  @ApiTags('common')
  async settingUpdate(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);

    return 'test';
  }
}
