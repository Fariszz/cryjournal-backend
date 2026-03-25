import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const exportQuerySchema = z.object({
  date_from: z.iso.datetime().optional(),
  date_to: z.iso.datetime().optional(),
});

export class ExportQueryDto extends createZodDto(exportQuerySchema) {}
