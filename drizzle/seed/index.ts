import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';
import * as schema from '../../src/db/schema';
import { seedAdmin } from './admin.seed';
import { seedDummyData } from './dummy.seed';

const seedEnvSchema = z.object({
  DB_URL: z.string().min(1),
  ADMIN_EMAIL: z.email().default('admin@cryjournal.local'),
  ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  ADMIN_NAME: z.string().min(1).default('Admin'),
});

async function runSeed(): Promise<number> {
  let pool: Pool | undefined;

  try {
    const env = seedEnvSchema.parse(process.env);

    pool = new Pool({
      connectionString: env.DB_URL,
    });

    const db = drizzle(pool, { schema });

    const result = await db.transaction(async (tx) => {
      console.log('[seed] transaction started');

      const admin = await seedAdmin(tx, env);
      const dummy = await seedDummyData(tx);

      return { admin, dummy };
    });

    console.log(
      `[seed] admin ${result.admin.action}: ${result.admin.admin.email}`,
    );

    if (result.dummy.skipped) {
      console.log('[seed] dummy seeding skipped because data already exists');
      for (const item of result.dummy.populatedTables) {
        console.log(`[seed] existing rows: ${item.table}=${item.count}`);
      }
    } else {
      console.log(
        `[seed] dummy seeding completed with target ${result.dummy.targetRowsPerTable} rows per table`,
      );
    }

    console.log('[seed] success');
    return 0;
  } catch (error) {
    console.error('[seed] failed. transaction rolled back.');
    console.error(error);
    return 1;
  } finally {
    if (pool) {
      await pool.end();
      console.log('[seed] database connection closed');
    }
  }
}

runSeed()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error: unknown) => {
    console.error('[seed] unexpected failure');
    console.error(error);
    process.exit(1);
  });
