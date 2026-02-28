import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(nodeScrypt);

const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const [salt, hex] = encodedHash.split(':');
  if (!salt || !hex) {
    return false;
  }

  const hash = (await scrypt(password, salt, KEY_LEN)) as Buffer;
  const original = Buffer.from(hex, 'hex');
  if (original.length !== hash.length) {
    return false;
  }
  return timingSafeEqual(original, hash);
}
