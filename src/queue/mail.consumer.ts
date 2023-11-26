import { QUEUE_MAIL } from '@/constants/queue';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(QUEUE_MAIL)
export class MailConsumer {
  constructor() {}

  @Process('send-notify-mail')
  async sendMail(job: Job<any>) {
    console.log(job.data);
  }
}
