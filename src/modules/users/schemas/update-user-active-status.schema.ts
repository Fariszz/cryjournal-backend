import { z } from 'zod';

export const updateUserActiveStatusSchema = z.object({
  isActive: z
    .boolean()
    .describe('Whether the user account should be active or inactive.'),
});

export type UpdateUserActiveStatusInput = z.infer<
  typeof updateUserActiveStatusSchema
>;
