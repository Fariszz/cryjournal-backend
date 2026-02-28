import { createZodDto } from 'nestjs-zod';
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

export const accountOverviewQuerySchema = accountAnalyticsQuerySchema.pick({
  date_from: true,
  date_to: true,
});

export const accountInstrumentsQuerySchema = accountAnalyticsQuerySchema.pick({
  date_from: true,
  date_to: true,
  page: true,
  page_size: true,
});

export const accountMonthQuerySchema = accountAnalyticsQuerySchema.pick({
  month: true,
});

export const accountRecentTradesQuerySchema = accountAnalyticsQuerySchema.pick({
  limit: true,
});

export const accountIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class HomeAnalyticsQueryDto extends createZodDto(homeAnalyticsQuerySchema) {}

export class AccountOverviewQueryDto extends createZodDto(
  accountOverviewQuerySchema,
) {}

export class AccountInstrumentsQueryDto extends createZodDto(
  accountInstrumentsQuerySchema,
) {}

export class AccountMonthQueryDto extends createZodDto(accountMonthQuerySchema) {}

export class AccountRecentTradesQueryDto extends createZodDto(
  accountRecentTradesQuerySchema,
) {}

export class AccountIdParamDto extends createZodDto(accountIdParamSchema) {}
