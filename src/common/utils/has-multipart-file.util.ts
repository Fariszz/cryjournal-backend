import type { MultipartFile } from '@fastify/multipart';
import type { FastifyRequest } from 'fastify';

export function hasMultipartFile(
  req: FastifyRequest,
): req is FastifyRequest & { file: () => Promise<MultipartFile | undefined> } {
  return typeof (req as { file?: unknown }).file === 'function';
}
