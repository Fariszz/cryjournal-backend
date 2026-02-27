import { jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './common';

export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  defaultTimezone: varchar('default_timezone', { length: 64 }).notNull(),
  defaultCurrency: varchar('default_currency', { length: 12 }).notNull(),
  defaultDateRangePreset: varchar('default_date_range_preset', {
    length: 32,
  }).notNull(),
  sessionDefinitions: jsonb('session_definitions').$type<
    Array<{ key: string; label: string; start: string; end: string }>
  >(),
  riskParameters: jsonb('risk_parameters').$type<Record<string, unknown>>(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
