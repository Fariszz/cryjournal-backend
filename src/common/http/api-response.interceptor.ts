import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (
          value &&
          typeof value === 'object' &&
          ('data' in value || 'error' in value)
        ) {
          return value;
        }
        return { data: value };
      }),
    );
  }
}
