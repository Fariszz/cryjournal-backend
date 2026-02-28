import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
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
