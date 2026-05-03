import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { env } from '@common/config/env';

const CORS_ALLOWED_METHODS: string[] = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
];

const CORS_ALLOWED_HEADERS: string[] = [
  'Accept',
  'Accept-Version',
  'Authorization',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Date',
  'Origin',
  'X-Api-Version',
  'X-CSRF-Token',
  'X-Requested-With',
];

function getAllowedOrigins(): string | string[] {
  const origins = env.CORS_ALLOWED_ORIGINS.split(',')
    .map((origin: string): string => origin.trim())
    .filter((origin: string): boolean => origin.length > 0);
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
  };
}
