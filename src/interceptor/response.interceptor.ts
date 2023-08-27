import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = {
          data: data,
          statusCode: context.getArgs()?.[1]?.statusCode || 200,
          message: null,
          error: null,
          isSuccess: true,
        };
        return response;
      }),
      catchError(async (err) => {
        const response = {
          statusCode: err?.response?.statusCode || 500,
          message: err?.response?.message || 'Unknow Error',
          error: err?.response?.error || 'Unknow Error',
          data: null,
          isSuccess: false,
        };
        return response;
      }),
    );
  }
}
