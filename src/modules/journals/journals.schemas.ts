import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@common/constants/pagination.constants';

export const journalCreateSchema = z.object({
  date: z
    .string()
    .min(1)
    .describe('Journal date in string format (recommended YYYY-MM-DD).'),
  accountId: z
    .uuid()
    .optional()
    .describe('Optional related account identifier in UUID format.'),
  mood: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe('Optional mood score from 1 to 5.'),
  energy: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe('Optional energy score from 1 to 5.'),
  focus: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe('Optional focus score from 1 to 5.'),
  confidence: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe('Optional confidence score from 1 to 5.'),
  plan: z.string().optional().describe('Optional trading plan notes.'),
  executionNotes: z
    .string()
    .optional()
    .describe('Optional execution notes written after trading session.'),
  lessons: z.string().optional().describe('Optional lessons learned.'),
  nextActions: z
    .string()
    .optional()
    .describe('Optional actionable follow-up tasks.'),
  tradeIds: z
    .array(z.string().uuid().describe('Trade identifier in UUID format.'))
    .optional()
    .describe('Optional list of linked trade identifiers.'),
  demonIds: z
    .array(z.string().uuid().describe('Demon identifier in UUID format.'))
    .optional()
    .describe('Optional list of linked demon identifiers.'),
});

export const journalUpdateSchema = journalCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const journalListQuerySchema = z.object({
  date_from: z
    .string()
    .optional()
    .describe('Optional start date filter (recommended YYYY-MM-DD).'),
  date_to: z
    .string()
    .optional()
    .describe('Optional end date filter (recommended YYYY-MM-DD).'),
  account_id: z
    .string()
    .uuid()
    .optional()
    .describe('Optional account identifier filter in UUID format.'),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_PAGE)
    .describe('Page number for paginated journal list (minimum 1).'),
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of items per page (maximum ${MAX_PAGE_SIZE}).`),
});

export const journalIdParamSchema = z.object({
  id: z.string().uuid().describe('Daily journal identifier in UUID format.'),
});

export const journalAttachmentIdParamSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe('Daily journal attachment identifier in UUID format.'),
});

export class JournalListQueryDto extends createZodDto(journalListQuerySchema) {}

export class JournalCreateDto extends createZodDto(journalCreateSchema) {}

export class JournalUpdateDto extends createZodDto(journalUpdateSchema) {}

export class JournalIdParamDto extends createZodDto(journalIdParamSchema) {}

export class JournalAttachmentIdParamDto extends createZodDto(
  journalAttachmentIdParamSchema,
) {}
