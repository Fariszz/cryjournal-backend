import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createdAt, numericRatio, updatedAt, uuidPk } from './common';

export const strategies = pgTable('strategies', {
  id: uuidPk(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  playbookScoreSchema: jsonb('playbook_score_schema').$type<
    Record<string, unknown>
  >(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const strategySteps = pgTable(
  'strategy_steps',
  {
    id: uuidPk(),
    strategyId: uuid('strategy_id')
      .notNull()
      .references(() => strategies.id, { onDelete: 'cascade' }),
    stepIndex: integer('step_index').notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    strategyIdx: index('strategy_steps_strategy_id_idx').on(table.strategyId),
  }),
);

export const strategyConfluences = pgTable(
  'strategy_confluences',
  {
    id: uuidPk(),
    strategyId: uuid('strategy_id')
      .notNull()
      .references(() => strategies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 150 }).notNull(),
    impactWeight: numericRatio('impact_weight').notNull(),
    ruleType: varchar('rule_type', { length: 64 }).notNull(),
    ruleConfig: jsonb('rule_config').$type<Record<string, unknown>>(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    strategyIdx: index('strategy_confluences_strategy_id_idx').on(
      table.strategyId,
    ),
    sortOrderIdx: index('strategy_confluences_sort_order_idx').on(
      table.sortOrder,
    ),
  }),
);
