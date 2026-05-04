import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { env } from '@common/config/env';

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

function getAllowedOrigins(): string | string[] {
  const raw = env.CORS_ALLOWED_ORIGINS || '';

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes('*')) {
    return '*';
  }

  return origins;
}
export function getCorsOptions(): CorsOptions {
  return {
    origin: getAllowedOrigins(),
    methods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false,
  };
}
