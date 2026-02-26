import { pgTable, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar(),
  email: varchar(),
  emailVerified: boolean().default(false),
});
