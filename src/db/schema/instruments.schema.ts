import {
  index,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, uuidPk } from './common';
import { users } from './users.schema';

export const instruments = pgTable(
  'instruments',
  {
    id: uuidPk(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    symbol: varchar('symbol', { length: 64 }).notNull(),
    category: varchar('category', { length: 64 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    symbolUnique: uniqueIndex('instruments_user_symbol_unique').on(
      table.userId,
      table.symbol,
    ),
    userIdx: index('instruments_user_id_idx').on(table.userId),
    symbolIdx: index('instruments_symbol_idx').on(table.symbol),
    categoryIdx: index('instruments_category_idx').on(table.category),
  }),
);
