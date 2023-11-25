import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('queue-mail')
export class MailConsumer {
  @Process('send')
  async sendMail(job: Job<any>) {
    console.log(job.data);
  }
}
