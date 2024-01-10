import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { Environment } from '@/configuration/validator/app.validator';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly _logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    super(LoggerService.name);

    const mode: Environment = this.configService.getOrThrow('app.nodeEnv');

    this._logger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.simple(),
          ),
        }),
        new DailyRotateFile({
          level: 'debug',
          filename: `./logs/${mode}/debug-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new DailyRotateFile({
          level: 'error',
          filename: `./logs/${mode}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });

    this._logger.setMaxListeners(0);
  }

  log(message: string): void {
    this._logger.info(message);
  }
  info(message: string): void {
    this._logger.info(message);
  }
  debug(message: string): void {
    this._logger.debug(message);
  }
  error(message: string, trace?: any, context?: string): void {
    // I think the trace should be JSON Stringifies
    const errorMsg = `${context || ''} ${message} -> (${
      trace || 'trace not provided !'
    })`;
    this._logger.error(errorMsg);
    // newrelic.noticeError(new Error(errorMsg));
  }
  warn(message: string): void {
    this._logger.warn(message);
  }
}
