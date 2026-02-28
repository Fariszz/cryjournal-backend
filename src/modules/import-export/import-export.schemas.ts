import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const exportQuerySchema = z.object({
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

export class ExportQueryDto extends createZodDto(exportQuerySchema) {}
