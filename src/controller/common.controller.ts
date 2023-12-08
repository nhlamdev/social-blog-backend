import { CommonService } from '@/service';
import { InjectQueue } from '@nestjs/bull';
// import { RabbitMQService } from '@/service/rabbitmq.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';

@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,

    @InjectQueue('QUEUE_MAIL') private queueMail: Queue,
  ) {}

  @Get('visualize')
  @ApiTags('common')
  async visualize() {
    const result = {
      visual: await this.commonService.ownerVisualizeData(),
      status: await this.commonService.status(),
    };

    return result;
  }

  @Get('status')
  @ApiTags('common')
  async() {
    return this.commonService.status();
  }

  @Get('all-notify')
  @ApiTags('common')
  async setting() {
    return this.commonService.allNotify();
  }

  @Get('test')
  @ApiTags('common')
  async settingUpdate() {
    this.queueMail.add(
      'send-notify-mail',
      { test: 'test' },
      {
        attempts: 3,
        backoff: 3000,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
