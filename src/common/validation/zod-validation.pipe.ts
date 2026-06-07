import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType, z } from 'zod';

@Injectable()
export class ZodValidationPipe<TSchema extends ZodType>
  implements PipeTransform
{
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.infer<TSchema> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
