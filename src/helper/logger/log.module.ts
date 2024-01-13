import { Module } from '@nestjs/common';
import { LoggerService } from './log.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LogModule {}
