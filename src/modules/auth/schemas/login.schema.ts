import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().describe('User email address in valid email format.'),
  password: z.string().min(1).describe('User password (minimum 1 character).'),
  rememberMe: z
    .boolean()
    .default(false)
    .describe('When true, keeps auth session for 30 days instead of 1 day.'),
});

export class LoginDto extends createZodDto(loginSchema) {}

export type LoginBody = z.infer<typeof loginSchema>;
export type LoginInput = LoginBody;
