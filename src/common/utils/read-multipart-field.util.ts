import type { Multipart } from '@fastify/multipart';

export function readMultipartField(
  field: Multipart | Multipart[] | undefined,
): unknown {
  const value = Array.isArray(field) ? field[0] : field;
  if (!value || !('value' in value)) {
    return undefined;
  }
  return value.value;
}
