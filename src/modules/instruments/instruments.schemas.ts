import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const instrumentCreateSchema = z.object({
  symbol: z.string().min(1),
  category: z.string().min(1),
});

export class InstrumentCreateDto extends createZodDto(instrumentCreateSchema) {}
