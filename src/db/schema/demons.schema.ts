import {
  index,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createdAt, numericRatio, updatedAt, uuidPk } from './common';
import { users } from './users.schema';

export const demons = pgTable(
  'demons',
  {
    id: uuidPk(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 150 }).notNull(),
    behavioralDensityScore: numericRatio('behavioral_density_score'),
    trigger: text('trigger'),
    pattern: text('pattern'),
    consequence: text('consequence'),
    counterPlan: text('counter_plan'),
    preventionChecklist: jsonb('prevention_checklist')
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    userIdx: index('demons_user_id_idx').on(table.userId),
  }),
);
