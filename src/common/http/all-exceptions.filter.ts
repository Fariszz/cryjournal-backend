import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const normalized =
        typeof body === 'string'
          ? { code: 'HTTP_EXCEPTION', message: body, details: [] }
          : {
              code:
                (body as Record<string, string>)['error'] ?? 'HTTP_EXCEPTION',
              message:
                (body as Record<string, string>)['message'] ??
                exception.message,
              details: Array.isArray(
                (body as Record<string, unknown>)['message'],
              )
                ? ((body as Record<string, unknown>)['message'] as unknown[])
                : [],
            };

      response.status(status).send({
        error: normalized,
        meta: {
          path: request.url,
          method: request.method,
        },
      });
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal Server Error';
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        details: [],
      },
      meta: {
        path: request.url,
        method: request.method,
      },
    });
  }
}
