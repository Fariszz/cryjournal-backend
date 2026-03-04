import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateSettingsSchema = z.object({
  defaultTimezone: z.string().min(1),
  defaultCurrency: z.string().min(1),
  defaultDateRangePreset: z.string().min(1),
  sessionDefinitions: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        start: z.string().min(1),
        end: z.string().min(1),
      }),
    )
    .optional(),
  riskParameters: z.record(z.string(), z.unknown()).optional(),
});

export class UpdateSettingsDto extends createZodDto(updateSettingsSchema) {}
