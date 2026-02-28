import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const tradeBaseSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(['executed', 'missed']),
  instrumentId: z.string().uuid(),
  direction: z.enum(['long', 'short']),
  timezone: z.string().min(1),
  entryDatetime: z.string().datetime(),
  exitDatetime: z.string().datetime().optional(),
  entryTimeframe: z.string().optional(),
  tradingSession: z.string().optional(),
  entryPrice: z.coerce.number().optional(),
  exitPrice: z.coerce.number().optional(),
  stopLoss: z.coerce.number().optional(),
  takeProfit: z.coerce.number().optional(),
  dollarRisk: z.coerce.number().optional(),
  positionSize: z.coerce.number().optional(),
  positionSizeUnit: z.enum(['lot', 'usd', 'contract']).optional(),
  brokerCommission: z.coerce.number().optional(),
  swap: z.coerce.number().optional(),
  fundingFee: z.coerce.number().optional(),
  positionType: z.enum(['spot', 'futures']).optional(),
  leverage: z.coerce.number().optional(),
  marginMode: z.enum(['cross', 'isolated']).optional(),
  strategyId: z.string().uuid().optional(),
  thesis: z.string().optional(),
  postAnalysis: z.string().optional(),
  notes: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  demonIds: z.array(z.string().uuid()).optional(),
  marketConditionTagIds: z.array(z.string().uuid()).optional(),
  marketConditionIds: z.array(z.string().uuid()).optional(),
  confluenceChecks: z
    .array(
      z.object({
        confluenceId: z.string().uuid(),
        checked: z.boolean(),
      }),
    )
    .optional(),
});

export const tradeCreateSchema = tradeBaseSchema.superRefine((value, ctx) => {
  if (value.type === 'missed') {
    return;
  }
  if (!value.entryPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'entryPrice is required for executed trade',
      path: ['entryPrice'],
    });
  }
});

export const tradeUpdateSchema = tradeBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const tradeListQuerySchema = z.object({
  account_id: z.string().uuid().optional(),
  instrument_id: z.string().uuid().optional(),
  strategy_id: z.string().uuid().optional(),
  type: z.enum(['executed', 'missed']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  session: z.string().optional(),
  tags: z.string().optional(),
  demons: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20),
});

export const tradeBulkSchema = z.object({
  tradeIds: z.array(z.string().uuid()).min(1),
  strategyId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const tradeIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const tradeAttachmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class TradeCreateDto extends createZodDto(tradeCreateSchema) {}

export class TradeUpdateDto extends createZodDto(tradeUpdateSchema) {}

export class TradeListQueryDto extends createZodDto(tradeListQuerySchema) {}

export class TradeBulkDto extends createZodDto(tradeBulkSchema) {}

export class TradeIdParamDto extends createZodDto(tradeIdParamSchema) {}

export class TradeAttachmentIdParamDto extends createZodDto(
  tradeAttachmentIdParamSchema,
) {}
