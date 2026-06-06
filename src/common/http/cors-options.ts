import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { env } from '@common/config/env';
import { getCorsAllowedOrigins } from '@common/http/allowed-origins.util';

const CORS_ALLOWED_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
];

const CORS_ALLOWED_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'X-Api-Version',
  'X-CSRF-Token',
  'X-Requested-With',
  'Content-MD5',
  'Content-Length',
];

export function getCorsOptions(): CorsOptions {
  return {
    origin: getCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS),
    methods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
}
