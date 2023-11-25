import { QUEUE_NOTIFY } from '@/constants/queue';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(QUEUE_NOTIFY)
export class NotifyConsumer {
  @Process('send')
  async sendMail(job: Job<any>) {
    console.log(job);
  }
}
