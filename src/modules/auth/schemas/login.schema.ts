import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().describe('User email address in valid email format.'),
  password: z.string().min(1).describe('User password (minimum 1 character).'),
});

export type LoginInput = z.infer<typeof loginSchema>;
