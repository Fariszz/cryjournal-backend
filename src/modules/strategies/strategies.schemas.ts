import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const strategyStepSchema = z.object({
  stepIndex: z
    .number()
    .int()
    .nonnegative()
    .describe('Step order index (integer starting from 0).'),
  title: z.string().min(1).describe('Step title (minimum 1 character).'),
  description: z.string().optional().describe('Optional step description.'),
});

export const strategyConfluenceSchema = z.object({
  name: z.string().min(1).describe('Confluence name (minimum 1 character).'),
  impactWeight: z
    .number()
    .min(0)
    .max(100)
    .describe('Confluence impact weight from 0 to 100.'),
  ruleType: z
    .string()
    .min(1)
    .describe('Confluence rule type (minimum 1 character).'),
  ruleConfig: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional rule configuration object.'),
  sortOrder: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe('Display sort order (integer starting from 0).'),
});

export const createStrategySchema = z.object({
  name: z.string().min(1).describe('Strategy name (minimum 1 character).'),
  description: z.string().optional().describe('Optional strategy description.'),
  tags: z
    .array(z.string().describe('Strategy tag text.'))
    .default([])
    .describe('List of strategy tags.'),
  playbookScoreSchema: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional score mapping for playbook criteria.'),
  steps: z
    .array(strategyStepSchema)
    .default([])
    .describe('Ordered strategy execution steps.'),
  confluences: z
    .array(strategyConfluenceSchema)
    .default([])
    .describe('Confluence rules attached to the strategy.'),
});

export const updateStrategySchema = createStrategySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const strategyIdParamSchema = z.object({
  id: z.string().uuid().describe('Strategy identifier in UUID format.'),
});

export class StrategyCreateDto extends createZodDto(createStrategySchema) {}

export class StrategyUpdateDto extends createZodDto(updateStrategySchema) {}

export class StrategyIdParamDto extends createZodDto(strategyIdParamSchema) {}
