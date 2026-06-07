import type { NextFunction, Request, Response } from 'express';
import {
  applyCorsHeaders,
  isAllowedCorsOrigin,
} from '@common/http/apply-cors-headers.util';
import { getCorsOptions } from '@common/http/cors-options';

function getRequestOrigin(
  originHeader: Request['headers']['origin'],
): string | undefined {
  if (typeof originHeader === 'string') {
    return originHeader;
  }
  if (Array.isArray(originHeader)) {
    const firstOrigin = originHeader[0];
    return typeof firstOrigin === 'string' ? firstOrigin : undefined;
  }
  return undefined;
}

/**
 * Ensures credentialed CORS headers are present on every response.
 * Re-applies headers right before the response is sent so later middleware
 * cannot drop Access-Control-Allow-Credentials.
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const normalizedOrigin = getRequestOrigin(req.headers.origin);
  const applyHeaders = (): void => {
    applyCorsHeaders(req, res);
  };
  applyHeaders();
  if (req.method === 'OPTIONS') {
    if (!normalizedOrigin || !isAllowedCorsOrigin(normalizedOrigin)) {
      res.status(403).end();
      return;
    }
    const corsOptions = getCorsOptions();
    res.status(corsOptions.optionsSuccessStatus ?? 204).end();
    return;
  }
  const originalEnd = res.end.bind(res);
  res.end = ((...args: Parameters<Response['end']>) => {
    applyHeaders();
    return originalEnd(...args);
  }) as Response['end'];
  next();
}
