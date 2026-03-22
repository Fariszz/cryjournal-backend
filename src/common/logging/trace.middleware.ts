import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { traceStorage } from './trace-context';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: unknown, res: unknown, next: () => void) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const traceId: string =
      (req as { headers: { 'x-trace-id': string } }).headers['x-trace-id'] ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      uuidv4();

    traceStorage.run({ traceId }, () => {
      next();
    });
  }
}
