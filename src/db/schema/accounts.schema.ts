import { index, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountTypeEnum } from './enums';
import {
  createdAt,
  deletedAt,
  numericMoney,
  updatedAt,
  uuidPk,
} from './common';

export const accountGroups = pgTable('account_groups', {
  id: uuidPk(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: uuidPk(),
    groupId: uuid('group_id').references(() => accountGroups.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 150 }).notNull(),
    broker: varchar('broker', { length: 150 }).notNull(),
    accountType: accountTypeEnum('account_type').notNull(),
    baseCurrency: varchar('base_currency', { length: 12 }).notNull(),
    timezone: varchar('timezone', { length: 64 }).notNull(),
    startingBalance: numericMoney('starting_balance'),
    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    groupIdx: index('accounts_group_id_idx').on(table.groupId),
    deletedIdx: index('accounts_deleted_at_idx').on(table.deletedAt),
  }),
);
