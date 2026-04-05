import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const economicCalendarQuerySchema = z.object({
  from: z.iso.datetime().describe('Start date-time in ISO 8601 format.'),
  to: z.iso.datetime().describe('End date-time in ISO 8601 format.'),
  impact: z.string().optional().describe('Optional event impact filter.'),
  currency: z.string().optional().describe('Optional event currency filter.'),
});

export const attachContextEventSchema = z.object({
  providerEventId: z
    .string()
    .min(1)
    .describe('Source provider event identifier (minimum 1 character).'),
  title: z
    .string()
    .min(1)
    .describe('Economic event title (minimum 1 character).'),
  impact: z.string().optional().describe('Optional event impact category.'),
  currency: z.string().optional().describe('Optional event currency code.'),
  eventTime: z.iso.datetime().describe('Event date-time in ISO 8601 format.'),
  raw: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional raw provider payload for the event.'),
});

export const tradeIdParamSchema = z.object({
  id: z.string().uuid().describe('Trade identifier in UUID format.'),
});

export class EconomicCalendarQueryDto extends createZodDto(
  economicCalendarQuerySchema,
) {}

export class AttachContextEventDto extends createZodDto(
  attachContextEventSchema,
) {}

export class TradeIdParamDto extends createZodDto(tradeIdParamSchema) {}
