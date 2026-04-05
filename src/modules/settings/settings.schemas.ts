import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateSettingsSchema = z.object({
  defaultTimezone: z
    .string()
    .min(1)
    .describe('Default IANA timezone (minimum 1 character).'),
  defaultCurrency: z
    .string()
    .min(1)
    .describe('Default currency code (minimum 1 character).'),
  defaultDateRangePreset: z
    .string()
    .min(1)
    .describe('Default date range preset key (minimum 1 character).'),
  sessionDefinitions: z
    .array(
      z.object({
        key: z.string().min(1).describe('Session key (minimum 1 character).'),
        label: z
          .string()
          .min(1)
          .describe('Session display label (minimum 1 character).'),
        start: z
          .string()
          .min(1)
          .describe(
            'Session start time, for example 08:00 (minimum 1 character).',
          ),
        end: z
          .string()
          .min(1)
          .describe(
            'Session end time, for example 16:00 (minimum 1 character).',
          ),
      }),
    )
    .describe('Optional list of custom trading session definitions.')
    .optional(),
  riskParameters: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional key-value risk management parameters.'),
});

export class UpdateSettingsDto extends createZodDto(updateSettingsSchema) {}
