import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z
    .string()
    .default('')
    .describe('Search keyword. Empty string returns default results.'),
});

export class SearchQueryDto extends createZodDto(searchQuerySchema) {}
