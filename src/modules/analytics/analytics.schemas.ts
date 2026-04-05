import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@common/constants/pagination.constants';

export const dateRangeSchema = z.object({
  date_from: z.iso
    .datetime()
    .describe('Start date-time in ISO 8601 format for analytics range.'),
  date_to: z.iso
    .datetime()
    .describe('End date-time in ISO 8601 format for analytics range.'),
});

export const homeAnalyticsQuerySchema = dateRangeSchema.extend({
  account_id: z
    .uuid()
    .optional()
    .describe('Optional account identifier to scope home analytics.'),
});

export const accountAnalyticsQuerySchema = dateRangeSchema.extend({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_PAGE)
    .describe('Page number for paginated analytics response (minimum 1).'),
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of items per page (maximum ${MAX_PAGE_SIZE}).`),
  month: z
    .string()
    .optional()
    .describe('Target month in YYYY-MM format for calendar analytics.'),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_LIMIT)
    .describe(
      `Maximum number of records to return (maximum ${MAX_PAGE_SIZE}).`,
    ),
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
  id: z.string().uuid().describe('Account identifier in UUID format.'),
});

export class HomeAnalyticsQueryDto extends createZodDto(
  homeAnalyticsQuerySchema,
) {}

export class AccountOverviewQueryDto extends createZodDto(
  accountOverviewQuerySchema,
) {}

export class AccountInstrumentsQueryDto extends createZodDto(
  accountInstrumentsQuerySchema,
) {}

export class AccountMonthQueryDto extends createZodDto(
  accountMonthQuerySchema,
) {}

export class AccountRecentTradesQueryDto extends createZodDto(
  accountRecentTradesQuerySchema,
) {}

export class AccountIdParamDto extends createZodDto(accountIdParamSchema) {}
