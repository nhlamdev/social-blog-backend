import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('queue-notify')
export class NotifyConsumer {
  @Process('send')
  async sendMail(job: Job<any>) {
    console.log(job);
  }
}
