import { Module } from '@nestjs/common';
import { LoggerService } from './log.service';

@Module({ providers: [LoggerService], exports: [LoggerService] })
export class LogModule {}
