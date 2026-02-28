import { z } from 'zod';

export const dateRangeSchema = z.object({
  date_from: z.string().datetime(),
  date_to: z.string().datetime(),
});

export const homeAnalyticsQuerySchema = dateRangeSchema.extend({
  account_id: z.string().uuid().optional(),
});

export const accountAnalyticsQuerySchema = dateRangeSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20),
  month: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
