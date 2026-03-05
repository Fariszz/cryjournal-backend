import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { hashPassword } from '../../src/common/auth/password.util';
import * as schema from '../../src/db/schema';

export type SeedDatabase = NodePgDatabase<typeof schema>;

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
  db: SeedDatabase,
  env: SeedEnv,
): Promise<AdminSeedResult> {
  console.log(`[seed:admin] seeding admin for ${env.ADMIN_EMAIL}`);

  const [existingAdmin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, env.ADMIN_EMAIL))
    .limit(1);

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  if (!existingAdmin) {
    const [insertedAdmin] = await db
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

  const [updatedAdmin] = await db
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
