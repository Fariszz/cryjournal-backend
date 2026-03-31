import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.email(),
    name: z.string().min(2),
  });

  it('returns parsed value for valid payload', () => {
    const pipe = new ZodValidationPipe(schema);
    const inputValue = {
      email: 'user@example.com',
      name: 'User Name',
    };

    const actual = pipe.transform(inputValue);

    expect(actual).toEqual(inputValue);
  });

  it('throws bad request for invalid payload', () => {
    const pipe = new ZodValidationPipe(schema);
    const inputValue = {
      email: 'invalid-email',
      name: '',
    };

    expect(() => pipe.transform(inputValue)).toThrow(BadRequestException);
  });
});
