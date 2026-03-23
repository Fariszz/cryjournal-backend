import type { MultipartFile } from '@fastify/multipart';
// import type { FastifyRequest } from 'fastify';
import type { Request as ExpressRequest, Response } from 'express';

export function hasMultipartFile(
  req: ExpressRequest,
): req is ExpressRequest & { file: () => Promise<MultipartFile | undefined> } {
  return typeof (req as { file?: unknown }).file === 'function';
}
