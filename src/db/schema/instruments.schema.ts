import { index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, uuidPk } from './common';

export const instruments = pgTable(
  'instruments',
  {
    id: uuidPk(),
    symbol: varchar('symbol', { length: 64 }).notNull(),
    category: varchar('category', { length: 64 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    symbolUnique: uniqueIndex('instruments_symbol_unique').on(table.symbol),
    symbolIdx: index('instruments_symbol_idx').on(table.symbol),
    categoryIdx: index('instruments_category_idx').on(table.category),
  }),
);
