/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{
      getHeader?: (name: string) => string | string[] | number | undefined;
    }>();

    return next.handle().pipe(
      map((value) => {
        const contentType = response.getHeader?.('content-type');
        const normalizedContentType = Array.isArray(contentType)
          ? contentType.join(';')
          : typeof contentType === 'string'
            ? contentType
            : '';

        if (normalizedContentType.includes('text/csv')) {
          return value;
        }

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
