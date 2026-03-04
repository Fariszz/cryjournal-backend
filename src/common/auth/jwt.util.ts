import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';

const jwtPayloadSchema = z
  .object({
    exp: z.number().int().positive(),
    iat: z.number().int().nonnegative(),
  })
  .catchall(z.unknown());

type JwtPayload = z.infer<typeof jwtPayloadSchema>;

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  return Buffer.from(padded, 'base64');
}

export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  ttlSeconds: number,
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const content = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(content).digest();
  return `${content}.${toBase64Url(signature)}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid token format');
  }
  const content = `${encodedHeader}.${encodedPayload}`;
  const expected = createHmac('sha256', secret).update(content).digest();
  const actual = fromBase64Url(encodedSignature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error('Invalid token signature');
  }

  const parsedPayload: unknown = JSON.parse(
    fromBase64Url(encodedPayload).toString('utf8'),
  );
  const payload = jwtPayloadSchema.parse(parsedPayload);
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error('Token expired');
  }
  return payload;
}
