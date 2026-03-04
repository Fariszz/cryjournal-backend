import {
  date,
  integer,
  numeric,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const uuidPk = () => uuid('id').defaultRandom().primaryKey();

export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull();

export const deletedAt = () => timestamp('deleted_at', { withTimezone: true });

export const numericMoney = (name: string) =>
  numeric(name, { precision: 20, scale: 8 });

export const numericRatio = (name: string) =>
  numeric(name, { precision: 12, scale: 6 });

export const metricDate = (name: string) => date(name, { mode: 'string' });

export const lockoutColumns = () => ({
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
});
