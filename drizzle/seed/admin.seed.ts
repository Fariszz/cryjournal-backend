import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../src/db/schema';

const SALT_ROUNDS = 10;

type SeedDatabase = NodePgDatabase<typeof schema>;
type TransactionCallback = Parameters<SeedDatabase['transaction']>[0];

export type SeedTransaction = Parameters<TransactionCallback>[0];

export interface SeedEnv {
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_NAME: string;
}

export interface AdminSeedResult {
  action: 'inserted' | 'updated';
  admin: typeof schema.users.$inferSelect;
}

export async function seedAdmin(
  tx: SeedTransaction,
  env: SeedEnv,
): Promise<AdminSeedResult> {
  console.log(`[seed:admin] seeding admin for ${env.ADMIN_EMAIL}`);

  const [existingAdmin] = await tx
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, env.ADMIN_EMAIL))
    .limit(1);

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, SALT_ROUNDS);

  if (!existingAdmin) {
    const [insertedAdmin] = await tx
      .insert(schema.users)
      .values({
        email: env.ADMIN_EMAIL,
        name: env.ADMIN_NAME,
        passwordHash,
      })
      .returning();

    if (!insertedAdmin) {
      throw new Error('Failed to insert admin user.');
    }

    console.log('[seed:admin] admin inserted');
    return { action: 'inserted', admin: insertedAdmin };
  }

  const [updatedAdmin] = await tx
    .update(schema.users)
    .set({
      name: env.ADMIN_NAME,
      passwordHash,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.email, env.ADMIN_EMAIL))
    .returning();

  if (!updatedAdmin) {
    throw new Error('Failed to update existing admin user.');
  }

  console.log('[seed:admin] admin updated');
  return { action: 'updated', admin: updatedAdmin };
}
