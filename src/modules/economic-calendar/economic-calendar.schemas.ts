import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const economicCalendarQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  impact: z.string().optional(),
  currency: z.string().optional(),
});

export const attachContextEventSchema = z.object({
  providerEventId: z.string().min(1),
  title: z.string().min(1),
  impact: z.string().optional(),
  currency: z.string().optional(),
  eventTime: z.string().datetime(),
  raw: z.record(z.string(), z.unknown()).optional(),
});

export const tradeIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class EconomicCalendarQueryDto extends createZodDto(
  economicCalendarQuerySchema,
) {}

export class AttachContextEventDto extends createZodDto(
  attachContextEventSchema,
) {}

export class TradeIdParamDto extends createZodDto(tradeIdParamSchema) {}
