import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email().describe('User email address in valid email format.'),
  password: z
    .string()
    .min(8)
    .describe('User password with minimum 8 characters.'),
  name: z.string().min(1).describe('User display name (minimum 1 character).'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
