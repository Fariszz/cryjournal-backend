import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const db = drizzle(process.env.DB_URL!, { schema });

export type DB = typeof db;

export type DbTransactionAdapter = TransactionalAdapterDrizzleOrm<typeof db>;

export default db;
