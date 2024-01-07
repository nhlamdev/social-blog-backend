import { client_data } from '@/shared/types/common.interface';
import { detectDevice } from '@/shared/utils/global-func';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PreprocessInfoMiddleware implements NestMiddleware {
  use(
    req: Request & {
      client_data: client_data;
    },
    res: Response,
    next: NextFunction,
  ) {
    const userAgent = req.headers['user-agent'];
    const info = detectDevice(userAgent);

    const ipAddress =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    req.client_data = { ...info, ['ip']: ipAddress.toString() };

    next();
  }
}
