import { Module } from '@nestjs/common';
import { LogModule } from './logger/log.module';
import { MailModule } from './mail/mail.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [LogModule, MailModule, MinioModule],
  exports: [LogModule, MailModule, MinioModule],
})
export class SharedModule {}
