import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'MAIL_QUEUE',
      settings: {},
      limiter: { max: 30, duration: 1000 },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class SharedModule {}
