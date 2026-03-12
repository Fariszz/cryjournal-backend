import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@common/constants/pagination.constants';

export const journalCreateSchema = z.object({
  date: z.string().min(1),
  accountId: z.string().uuid().optional(),
  mood: z.number().min(1).max(5).optional(),
  energy: z.number().min(1).max(5).optional(),
  focus: z.number().min(1).max(5).optional(),
  confidence: z.number().min(1).max(5).optional(),
  plan: z.string().optional(),
  executionNotes: z.string().optional(),
  lessons: z.string().optional(),
  nextActions: z.string().optional(),
  tradeIds: z.array(z.string().uuid()).optional(),
  demonIds: z.array(z.string().uuid()).optional(),
});

export const journalUpdateSchema = journalCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const journalListQuerySchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  account_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export const journalIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const journalAttachmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class JournalListQueryDto extends createZodDto(journalListQuerySchema) {}

export class JournalCreateDto extends createZodDto(journalCreateSchema) {}

export class JournalUpdateDto extends createZodDto(journalUpdateSchema) {}

export class JournalIdParamDto extends createZodDto(journalIdParamSchema) {}

export class JournalAttachmentIdParamDto extends createZodDto(
  journalAttachmentIdParamSchema,
) {}
