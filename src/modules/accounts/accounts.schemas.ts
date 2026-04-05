import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AccountTypeEnum } from '@common/enums/account-type.enum';
import { AccountArchivedQueryEnum } from '@common/enums/account-archived-query.enum';

export const accountGroupCreateSchema = z.object({
  name: z.string().min(1).describe('Account group name (minimum 1 character).'),
  description: z
    .string()
    .optional()
    .describe('Optional account group description.'),
});

export const accountGroupUpdateSchema = accountGroupCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const accountCreateSchema = z.object({
  groupId: z
    .uuid()
    .nullable()
    .optional()
    .describe(
      'Optional account group identifier. Use null for ungrouped accounts.',
    ),
  name: z
    .string()
    .min(1)
    .describe('Trading account name (minimum 1 character).'),
  broker: z
    .string()
    .min(1)
    .describe('Broker or exchange name (minimum 1 character).'),
  accountType: z
    .enum(AccountTypeEnum)
    .describe('Account type value based on supported account type enum.'),
  baseCurrency: z
    .string()
    .min(1)
    .describe('Account base currency code (minimum 1 character).'),
  timezone: z
    .string()
    .min(1)
    .describe('IANA timezone for the account, for example Asia/Jakarta.'),
  startingBalance: z.coerce
    .number()
    .optional()
    .describe('Optional account starting balance.'),
});

export const accountUpdateSchema = accountCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const accountListSchema = z.object({
  group_id: z
    .string()
    .uuid()
    .optional()
    .describe('Optional account group identifier filter.'),
  archived: z
    .enum(AccountArchivedQueryEnum)
    .optional()
    .describe('Optional archived-state filter for account listing.'),
});

export const accountGroupIdParamSchema = z.object({
  id: z.string().uuid().describe('Account group identifier in UUID format.'),
});

export const accountIdParamSchema = z.object({
  id: z.string().uuid().describe('Account identifier in UUID format.'),
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
