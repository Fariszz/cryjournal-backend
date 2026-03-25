import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@common/constants/pagination.constants';
import { TradeDirectionEnum } from '@common/enums/trade-direction.enum';
import { TradeMarginModeEnum } from '@common/enums/trade-margin-mode.enum';
import { TradePositionSizeUnitEnum } from '@common/enums/trade-position-size-unit.enum';
import { TradePositionTypeEnum } from '@common/enums/trade-position-type.enum';
import { TradeTypeEnum } from '@common/enums/trade-type.enum';

export const tradeBaseSchema = z.object({
  accountId: z.uuid(),
  type: z.enum(TradeTypeEnum),
  instrumentId: z.uuid(),
  direction: z.enum(TradeDirectionEnum),
  timezone: z.string().min(1),
  entryDatetime: z.iso.datetime(),
  exitDatetime: z.iso.datetime().optional(),
  entryTimeframe: z.string().optional(),
  tradingSession: z.string().optional(),
  entryPrice: z.coerce.number().optional(),
  exitPrice: z.coerce.number().optional(),
  stopLoss: z.coerce.number().optional(),
  takeProfit: z.coerce.number().optional(),
  dollarRisk: z.coerce.number().optional(),
  positionSize: z.coerce.number().optional(),
  positionSizeUnit: z.enum(TradePositionSizeUnitEnum).optional(),
  brokerCommission: z.coerce.number().optional(),
  swap: z.coerce.number().optional(),
  fundingFee: z.coerce.number().optional(),
  positionType: z.enum(TradePositionTypeEnum).optional(),
  positionTyppe: z
    .enum([TradePositionTypeEnum.SPOT, TradePositionTypeEnum.FUTURES])
    .optional(),
  leverage: z.coerce.number().optional(),
  marginMode: z.enum(TradeMarginModeEnum).optional(),
  strategyId: z.uuid().optional(),
  thesis: z.string().optional(),
  postAnalysis: z.string().optional(),
  notes: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  demonIds: z.array(z.string().uuid()).optional(),
  marketConditionTagIds: z.array(z.uuid()).optional(),
  marketConditionIds: z.array(z.uuid()).optional(),
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
  if (value.type === TradeTypeEnum.MISSED) {
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
  type: z.nativeEnum(TradeTypeEnum).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  session: z.string().optional(),
  tags: z.string().optional(),
  demons: z.string().optional(),
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
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
