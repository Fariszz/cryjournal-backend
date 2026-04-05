import { z } from 'zod';

export const updateUserSchema = z.object({
  email: z
    .string()
    .email()
    .optional()
    .describe('Optional user email address in valid email format.'),
  name: z
    .string()
    .min(2)
    .optional()
    .describe('Optional user display name with minimum 2 characters.'),
  password: z
    .string()
    .min(6)
    .optional()
    .describe('Optional user password with minimum 6 characters.'),
  isActive: z
    .boolean()
    .optional()
    .describe('Optional active status flag for the user account.'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
