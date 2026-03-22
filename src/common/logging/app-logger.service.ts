/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { getTraceId } from './trace-context';

const { combine, timestamp, printf, colorize, errors, splat } = format;

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger = createLogger({
    level: 'debug',
    format: combine(
      errors({ stack: true }),
      splat(),

      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

      colorize({ all: true }),

      printf((info) => {
        const traceId = getTraceId() || 'no-trace';

        const context = info.context || 'App';

        return `${info.timestamp} [${traceId}] [${context}] ${info.level}: ${info.message}`;
      }),
    ),
    transports: [new transports.Console()],
  });

  log(message: unknown, context?: string): void {
    this.logger.info({ context, message });
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.logger.error({ context, message, trace });
  }

  warn(message: unknown, context?: string): void {
    this.logger.warn({ context, message });
  }

  debug(message: unknown, context?: string): void {
    this.logger.debug({ context, message });
  }

  verbose(message: unknown, context?: string): void {
    this.logger.verbose({ context, message });
  }
}
