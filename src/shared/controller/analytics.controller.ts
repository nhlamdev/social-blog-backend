import { InjectQueue } from '@nestjs/bull';
import { Controller, Get } from '@nestjs/common';
import { Queue } from 'bull';

@Controller()
export class AnalyticsController {
  constructor(@InjectQueue('MAIL_QUEUE') private audioQueue: Queue) {}

  @Get('/test/test')
  async test() {
    await this.audioQueue.add('test');
  }
}
