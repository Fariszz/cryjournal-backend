import { z } from 'zod';

export const accountGroupCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const accountGroupUpdateSchema = accountGroupCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const accountCreateSchema = z.object({
  groupId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  broker: z.string().min(1),
  accountType: z.enum(['crypto', 'forex', 'stocks']),
  baseCurrency: z.string().min(1),
  timezone: z.string().min(1),
  startingBalance: z.coerce.number().optional(),
});

export const accountUpdateSchema = accountCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const accountListSchema = z.object({
  group_id: z.string().uuid().optional(),
  archived: z.enum(['true', 'false']).optional(),
});

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
