import { z } from 'zod';

export const updateUserActiveStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateUserActiveStatusInput = z.infer<
  typeof updateUserActiveStatusSchema
>;
