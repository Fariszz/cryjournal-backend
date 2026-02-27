import {
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { accounts } from './accounts.schema';
import { createdAt, deletedAt, metricDate, updatedAt, uuidPk } from './common';
import { demons } from './demons.schema';
import { trades } from './trades.schema';

export const dailyJournals = pgTable(
  'daily_journals',
  {
    id: uuidPk(),
    date: metricDate('date').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, {
      onDelete: 'set null',
    }),
    mood: integer('mood'),
    energy: integer('energy'),
    focus: integer('focus'),
    confidence: integer('confidence'),
    plan: text('plan'),
    executionNotes: text('execution_notes'),
    lessons: text('lessons'),
    nextActions: text('next_actions'),
    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    uniqueDateAccount: uniqueIndex('daily_journals_date_account_unique').on(
      table.date,
      table.accountId,
    ),
  }),
);

export const dailyJournalTrades = pgTable(
  'daily_journal_trades',
  {
    dailyJournalId: uuid('daily_journal_id')
      .notNull()
      .references(() => dailyJournals.id, { onDelete: 'cascade' }),
    tradeId: uuid('trade_id')
      .notNull()
      .references(() => trades.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniquePair: uniqueIndex('daily_journal_trades_unique').on(
      table.dailyJournalId,
      table.tradeId,
    ),
  }),
);

export const dailyJournalDemons = pgTable(
  'daily_journal_demons',
  {
    dailyJournalId: uuid('daily_journal_id')
      .notNull()
      .references(() => dailyJournals.id, { onDelete: 'cascade' }),
    demonId: uuid('demon_id')
      .notNull()
      .references(() => demons.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    uniquePair: uniqueIndex('daily_journal_demons_unique').on(
      table.dailyJournalId,
      table.demonId,
    ),
  }),
);

export const dailyJournalAttachments = pgTable('daily_journal_attachments', {
  id: uuidPk(),
  dailyJournalId: uuid('daily_journal_id')
    .notNull()
    .references(() => dailyJournals.id, { onDelete: 'cascade' }),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  caption: varchar('caption', { length: 255 }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
