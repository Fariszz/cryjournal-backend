import { boolean, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createdAt, lockoutColumns, updatedAt, uuidPk } from './common';
import { pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuidPk(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    ...lockoutColumns(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    usersEmailUnique: uniqueIndex('users_email_unique').on(table.email),
  }),
);
