import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const demonCreateSchema = z.object({
  name: z.string().min(1),
  trigger: z.string().optional(),
  pattern: z.string().optional(),
  consequence: z.string().optional(),
  counterPlan: z.string().optional(),
  preventionChecklist: z.array(z.string()).default([]),
});

export const demonUpdateSchema = demonCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const evidenceCreateSchema = z.object({
  tradeId: z.uuid().optional(),
  dailyJournalId: z.uuid().optional(),
  note: z.string().optional(),
  screenshotPath: z.string().optional(),
});

export const demonIdParamSchema = z.object({
  id: z.uuid(),
});

export class DemonCreateDto extends createZodDto(demonCreateSchema) {}

export class DemonUpdateDto extends createZodDto(demonUpdateSchema) {}

export class EvidenceCreateDto extends createZodDto(evidenceCreateSchema) {}

export class DemonIdParamDto extends createZodDto(demonIdParamSchema) {}
