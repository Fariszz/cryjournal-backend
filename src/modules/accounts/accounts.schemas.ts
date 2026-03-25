import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AccountTypeEnum } from '@common/enums/account-type.enum';
import { AccountArchivedQueryEnum } from '@common/enums/account-archived-query.enum';

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
  groupId: z.uuid().nullable().optional(),
  name: z.string().min(1),
  broker: z.string().min(1),
  accountType: z.enum(AccountTypeEnum),
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
  archived: z.enum(AccountArchivedQueryEnum).optional(),
});

export const accountGroupIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const accountIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class AccountGroupCreateDto extends createZodDto(
  accountGroupCreateSchema,
) {}

export class AccountGroupUpdateDto extends createZodDto(
  accountGroupUpdateSchema,
) {}

export class AccountCreateDto extends createZodDto(accountCreateSchema) {}

export class AccountUpdateDto extends createZodDto(accountUpdateSchema) {}

export class AccountListQueryDto extends createZodDto(accountListSchema) {}

export class AccountGroupIdParamDto extends createZodDto(
  accountGroupIdParamSchema,
) {}

export class AccountIdParamDto extends createZodDto(accountIdParamSchema) {}
