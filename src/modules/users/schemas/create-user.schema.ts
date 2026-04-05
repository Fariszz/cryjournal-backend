import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string()
    .email()
    .describe('User email address in valid email format.'),
  name: z
    .string()
    .min(2)
    .describe('User display name with minimum 2 characters.'),
  password: z
    .string()
    .min(6)
    .describe('User password with minimum 6 characters.'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
