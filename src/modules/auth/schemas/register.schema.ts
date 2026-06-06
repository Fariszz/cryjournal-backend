import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email().describe('User email address in valid email format.'),
  password: z
    .string()
    .min(8)
    .describe('User password with minimum 8 characters.'),
  name: z.string().min(1).describe('User display name (minimum 1 character).'),
  rememberMe: z
    .boolean()
    .default(false)
    .describe('When true, keeps auth session for 30 days instead of 1 day.'),
});

export class RegisterDto extends createZodDto(registerSchema) {}

export type RegisterBody = z.infer<typeof registerSchema>;
export type RegisterInput = RegisterBody;
