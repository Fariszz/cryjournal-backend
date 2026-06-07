import type { IncomingMessage, ServerResponse } from 'http';
import type { Request, Response } from 'express';
import { env } from '@common/config/env';
import { getExplicitAllowedOrigins } from '@common/http/allowed-origins.util';
import { getCorsOptions } from '@common/http/cors-options';

type CorsRequest = IncomingMessage | Request;
type CorsResponse = ServerResponse | Response;

/**
 * Returns whether the request origin is allowed by CORS configuration.
 */
export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }
  return getExplicitAllowedOrigins(env.CORS_ALLOWED_ORIGINS).includes(origin);
}

/**
 * Applies credentialed CORS headers for allowed origins.
 */
export function applyCorsHeaders(req: CorsRequest, res: CorsResponse): void {
  const origin = req.headers.origin;
  if (!origin || typeof origin !== 'string' || !isAllowedCorsOrigin(origin)) {
    return;
  }
  const corsOptions = getCorsOptions();
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  if (req.method !== 'OPTIONS') {
    return;
  }
  const methods = corsOptions.methods;
  if (methods) {
    res.setHeader(
      'Access-Control-Allow-Methods',
      Array.isArray(methods) ? methods.join(',') : methods,
    );
  }
  const allowedHeaders = corsOptions.allowedHeaders;
  if (allowedHeaders) {
    res.setHeader(
      'Access-Control-Allow-Headers',
      Array.isArray(allowedHeaders) ? allowedHeaders.join(',') : allowedHeaders,
    );
  }
  if (corsOptions.maxAge !== undefined) {
    res.setHeader('Access-Control-Max-Age', String(corsOptions.maxAge));
  }
}
