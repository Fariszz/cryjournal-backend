import { compare, hash } from 'bcrypt';
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  encodedHash: string | null,
): Promise<boolean> {
  if (!encodedHash) {
    return false;
  }
  return compare(password, encodedHash);
}
