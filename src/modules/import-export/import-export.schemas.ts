import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const exportQuerySchema = z.object({
  date_from: z.iso
    .datetime()
    .optional()
    .describe('Optional start date-time in ISO 8601 format.'),
  date_to: z.iso
    .datetime()
    .optional()
    .describe('Optional end date-time in ISO 8601 format.'),
});

export class ExportQueryDto extends createZodDto(exportQuerySchema) {}
