import { jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createdAt, numericRatio, updatedAt, uuidPk } from './common';

export const demons = pgTable('demons', {
  id: uuidPk(),
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
});
