import { CommonService } from '@/service';
import { Controller, Get, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @Inject('QUEUE_NOTIFY')
    private subscribersService: ClientProxy,
  ) {
    this.subscribersService.connect();
  }

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
  async settingUpdate() {
    return await this.subscribersService.send(
      {
        cmd: 'notifications',
      },
      JSON.stringify({ data: 'test data' }),
    );
  }

  @MessagePattern({ cmd: 'notifications' })
  async addSubscriber(@Payload() subscriber, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    channel.ack(originalMsg);

    console.log('subscriber : ', subscriber);
  }
}
