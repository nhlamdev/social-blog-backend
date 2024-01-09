import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly _logger: winston.Logger;

  // constructor(private readonly _configService: GlobalConfigService) {
  //   super(AppLoggerService.name);

  //   this._logger = winston.createLogger(this._configService.winstonConfig);
  //   this._logger.setMaxListeners(0);
  // }
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
