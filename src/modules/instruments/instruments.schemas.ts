import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const instrumentCreateSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Instrument symbol (minimum 1 character).'),
  category: z
    .string()
    .min(1)
    .describe('Instrument category (minimum 1 character).'),
});

export class InstrumentCreateDto extends createZodDto(instrumentCreateSchema) {}
