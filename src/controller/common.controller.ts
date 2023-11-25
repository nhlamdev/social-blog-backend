import { CommonService } from '@/service';
import { InjectQueue } from '@nestjs/bull';
// import { RabbitMQService } from '@/service/rabbitmq.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { QUEUE_MAIL } from '@/constants/queue';

@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @InjectQueue(QUEUE_MAIL) private queueMail: Queue,
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
  async settingUpdate() {
    this.queueMail.add('send', { test: 'test' }, { removeOnComplete: true });
  }
}
