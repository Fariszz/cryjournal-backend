import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().default(''),
});

export class SearchQueryDto extends createZodDto(searchQuerySchema) {}
