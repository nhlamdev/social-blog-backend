import { Module } from '@nestjs/common';
import { LogModule } from './logger/log.module';
import { MailModule } from './mail/mail.module';

@Module({ imports: [LogModule, MailModule], exports: [LogModule, MailModule] })
export class SharedModule {}
