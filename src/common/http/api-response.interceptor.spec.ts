import { type CallHandler, type ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { ApiResponseInterceptor } from './api-response.interceptor';

interface ResponseWithHeader {
  getHeader: (name: string) => string | string[] | undefined;
}

function createExecutionContext(contentType: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getResponse: () =>
        ({
          getHeader: () => contentType,
        }) as ResponseWithHeader,
    }),
  } as ExecutionContext;
}

function createCallHandler(value: unknown): CallHandler {
  return {
    handle: () => of(value),
  };
}

describe('ApiResponseInterceptor', () => {
  let interceptor: ApiResponseInterceptor;

  beforeEach(() => {
    interceptor = new ApiResponseInterceptor();
  });

  it('wraps plain values into a data envelope', async () => {
    const context = createExecutionContext('application/json');
    const next = createCallHandler(['a', 'b']);

    const actual = await lastValueFrom(interceptor.intercept(context, next));

    expect(actual).toEqual({ data: ['a', 'b'] });
  });

  it('keeps pre-wrapped responses unchanged', async () => {
    const context = createExecutionContext('application/json');
    const next = createCallHandler({ data: { id: 'user-id-1' } });

    const actual = await lastValueFrom(interceptor.intercept(context, next));

    expect(actual).toEqual({ data: { id: 'user-id-1' } });
  });

  it('does not wrap csv responses', async () => {
    const context = createExecutionContext('text/csv; charset=utf-8');
    const next = createCallHandler('id,email\n1,user@example.com');

    const actual = await lastValueFrom(interceptor.intercept(context, next));

    expect(actual).toBe('id,email\n1,user@example.com');
  });
});
