import {
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  createdAt,
  metricDate,
  numericMoney,
  numericRatio,
  updatedAt,
  uuidPk,
} from './common';
import { demons } from './demons.schema';
import { dailyJournals } from './journals.schema';
import { trades } from './trades.schema';

export const demonEvidenceLogs = pgTable('demon_evidence_logs', {
  id: uuidPk(),
  demonId: uuid('demon_id')
    .notNull()
    .references(() => demons.id, { onDelete: 'cascade' }),
  tradeId: uuid('trade_id').references(() => trades.id, {
    onDelete: 'set null',
  }),
  dailyJournalId: uuid('daily_journal_id').references(() => dailyJournals.id, {
    onDelete: 'set null',
  }),
  note: text('note'),
  screenshotPath: varchar('screenshot_path', { length: 500 }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const demonPerformanceLogs = pgTable(
  'demon_performance_logs',
  {
    id: uuidPk(),
    demonId: uuid('demon_id')
      .notNull()
      .references(() => demons.id, { onDelete: 'cascade' }),
    date: metricDate('date').notNull(),
    densityScore: numericRatio('density_score'),
    pnlWhenPresent: numericMoney('pnl_when_present'),
    pnlWhenAbsent: numericMoney('pnl_when_absent'),
    winratePresent: numericRatio('winrate_present'),
    winrateAbsent: numericRatio('winrate_absent'),
    snapshotJson: jsonb('snapshot_json').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (table) => ({
    uniqueDemonDate: uniqueIndex('demon_performance_logs_demon_date_unique').on(
      table.demonId,
      table.date,
    ),
  }),
);
