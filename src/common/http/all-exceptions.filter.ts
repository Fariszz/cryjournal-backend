import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestMeta = {
      path: request.url,
      method: request.method,
    };

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

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `HTTP exception on ${requestMeta.method} ${requestMeta.path}`,
          JSON.stringify({
            status,
            error: normalized.code,
            message: normalized.message,
            exception: this.serializeException(exception),
          }),
        );
      }

      response.status(status).send({
        error: normalized,
        meta: requestMeta,
      });
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal Server Error';

    this.logger.error(
      `Unhandled exception on ${requestMeta.method} ${requestMeta.path}`,
      JSON.stringify(this.serializeException(exception)),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        details: [],
      },
      meta: requestMeta,
    });
  }

  private serializeException(exception: unknown) {
    if (!(exception instanceof Error)) {
      return { value: exception };
    }

    const errorWithMetadata = exception as Error & {
      code?: string;
      detail?: string;
      hint?: string;
      severity?: string;
      schema?: string;
      table?: string;
      column?: string;
      constraint?: string;
      where?: string;
      cause?: unknown;
    };

    return {
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
      code: errorWithMetadata.code,
      detail: errorWithMetadata.detail,
      hint: errorWithMetadata.hint,
      severity: errorWithMetadata.severity,
      schema: errorWithMetadata.schema,
      table: errorWithMetadata.table,
      column: errorWithMetadata.column,
      constraint: errorWithMetadata.constraint,
      where: errorWithMetadata.where,
      cause:
        errorWithMetadata.cause instanceof Error
          ? {
              name: errorWithMetadata.cause.name,
              message: errorWithMetadata.cause.message,
              stack: errorWithMetadata.cause.stack,
            }
          : errorWithMetadata.cause,
    };
  }
}
