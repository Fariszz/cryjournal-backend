import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const demonCreateSchema = z.object({
  name: z.string().min(1).describe('Demon name (minimum 1 character).'),
  trigger: z
    .string()
    .optional()
    .describe('Optional trigger condition description.'),
  pattern: z
    .string()
    .optional()
    .describe('Optional recurring behavior pattern.'),
  consequence: z
    .string()
    .optional()
    .describe('Optional negative consequence description.'),
  counterPlan: z
    .string()
    .optional()
    .describe('Optional counter-plan to handle the demon.'),
  preventionChecklist: z
    .array(z.string().describe('Checklist item text.'))
    .default([])
    .describe('Preventive checklist items to avoid this demon.'),
});

export const demonUpdateSchema = demonCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const evidenceCreateSchema = z.object({
  tradeId: z
    .uuid()
    .optional()
    .describe('Optional related trade identifier (UUID).'),
  dailyJournalId: z
    .uuid()
    .optional()
    .describe('Optional related daily journal identifier (UUID).'),
  note: z.string().optional().describe('Optional evidence note text.'),
  screenshotPath: z
    .string()
    .optional()
    .describe('Optional screenshot storage path for the evidence item.'),
});

export const demonIdParamSchema = z.object({
  id: z.uuid().describe('Demon identifier in UUID format.'),
});

export class DemonCreateDto extends createZodDto(demonCreateSchema) {}

export class DemonUpdateDto extends createZodDto(demonUpdateSchema) {}

export class EvidenceCreateDto extends createZodDto(evidenceCreateSchema) {}

export class DemonIdParamDto extends createZodDto(demonIdParamSchema) {}
