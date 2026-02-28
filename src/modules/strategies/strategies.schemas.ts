import { z } from 'zod';

export const strategyStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const strategyConfluenceSchema = z.object({
  name: z.string().min(1),
  impactWeight: z.number().min(0).max(100),
  ruleType: z.string().min(1),
  ruleConfig: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const createStrategySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  playbookScoreSchema: z.record(z.string(), z.unknown()).optional(),
  steps: z.array(strategyStepSchema).default([]),
  confluences: z.array(strategyConfluenceSchema).default([]),
});

export const updateStrategySchema = createStrategySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });
