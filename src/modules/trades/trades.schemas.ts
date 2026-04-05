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
  accountId: z.uuid().describe('Account identifier in UUID format.'),
  type: z
    .enum(TradeTypeEnum)
    .describe('Trade type value based on supported trade type enum.'),
  instrumentId: z.uuid().describe('Instrument identifier in UUID format.'),
  direction: z
    .enum(TradeDirectionEnum)
    .describe('Trade direction value based on supported direction enum.'),
  timezone: z
    .string()
    .min(1)
    .describe('IANA timezone for the trade, for example Asia/Jakarta.'),
  entryDatetime: z.iso
    .datetime()
    .describe('Trade entry date-time in ISO 8601 format.'),
  exitDatetime: z.iso
    .datetime()
    .optional()
    .describe('Optional trade exit date-time in ISO 8601 format.'),
  entryTimeframe: z
    .string()
    .optional()
    .describe('Optional entry timeframe label, for example 15m.'),
  tradingSession: z
    .string()
    .optional()
    .describe('Optional trading session label.'),
  entryPrice: z.coerce
    .number()
    .optional()
    .describe('Optional entry price value.'),
  exitPrice: z.coerce
    .number()
    .optional()
    .describe('Optional exit price value.'),
  stopLoss: z.coerce
    .number()
    .optional()
    .describe('Optional stop-loss price value.'),
  takeProfit: z.coerce
    .number()
    .optional()
    .describe('Optional take-profit price value.'),
  dollarRisk: z.coerce
    .number()
    .optional()
    .describe('Optional dollar risk amount.'),
  positionSize: z.coerce
    .number()
    .optional()
    .describe('Optional position size value.'),
  positionSizeUnit: z
    .enum(TradePositionSizeUnitEnum)
    .optional()
    .describe('Optional position size unit enum value.'),
  brokerCommission: z.coerce
    .number()
    .optional()
    .describe('Optional broker commission amount.'),
  swap: z.coerce.number().optional().describe('Optional swap fee amount.'),
  fundingFee: z.coerce
    .number()
    .optional()
    .describe('Optional funding fee amount.'),
  positionType: z
    .enum(TradePositionTypeEnum)
    .optional()
    .describe('Optional position type enum value.'),
  positionTyppe: z
    .enum([TradePositionTypeEnum.SPOT, TradePositionTypeEnum.FUTURES])
    .optional()
    .describe('Deprecated alias for positionType.'),
  leverage: z.coerce
    .number()
    .optional()
    .describe('Optional leverage multiplier.'),
  marginMode: z
    .enum(TradeMarginModeEnum)
    .optional()
    .describe('Optional margin mode enum value.'),
  strategyId: z
    .uuid()
    .optional()
    .describe('Optional strategy identifier in UUID format.'),
  thesis: z.string().optional().describe('Optional pre-trade thesis note.'),
  postAnalysis: z
    .string()
    .optional()
    .describe('Optional post-trade analysis note.'),
  notes: z.string().optional().describe('Optional additional trade note.'),
  tagIds: z
    .array(z.string().uuid().describe('Tag identifier in UUID format.'))
    .optional()
    .describe('Optional list of related tag identifiers.'),
  demonIds: z
    .array(z.string().uuid().describe('Demon identifier in UUID format.'))
    .optional()
    .describe('Optional list of related demon identifiers.'),
  marketConditionTagIds: z
    .array(z.uuid().describe('Market condition tag identifier in UUID format.'))
    .optional()
    .describe('Optional list of related market condition tag identifiers.'),
  marketConditionIds: z
    .array(z.uuid().describe('Market condition identifier in UUID format.'))
    .optional()
    .describe('Optional list of related market condition identifiers.'),
  confluenceChecks: z
    .array(
      z.object({
        confluenceId: z
          .string()
          .uuid()
          .describe('Confluence identifier in UUID format.'),
        checked: z.boolean().describe('Whether the confluence was satisfied.'),
      }),
    )
    .describe('Optional checklist of confluence outcomes.')
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
  account_id: z
    .string()
    .uuid()
    .optional()
    .describe('Optional account identifier filter in UUID format.'),
  instrument_id: z
    .string()
    .uuid()
    .optional()
    .describe('Optional instrument identifier filter in UUID format.'),
  strategy_id: z
    .string()
    .uuid()
    .optional()
    .describe('Optional strategy identifier filter in UUID format.'),
  type: z
    .nativeEnum(TradeTypeEnum)
    .optional()
    .describe('Optional trade type enum filter.'),
  date_from: z
    .string()
    .datetime()
    .optional()
    .describe('Optional start date-time filter in ISO 8601 format.'),
  date_to: z
    .string()
    .datetime()
    .optional()
    .describe('Optional end date-time filter in ISO 8601 format.'),
  session: z.string().optional().describe('Optional trading session filter.'),
  tags: z
    .string()
    .optional()
    .describe('Optional comma-separated tag identifier filter.'),
  demons: z
    .string()
    .optional()
    .describe('Optional comma-separated demon identifier filter.'),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_PAGE)
    .describe('Page number for paginated trade list (minimum 1).'),
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of items per page (maximum ${MAX_PAGE_SIZE}).`),
});

export const tradeBulkSchema = z.object({
  tradeIds: z
    .array(z.string().uuid().describe('Trade identifier in UUID format.'))
    .min(1)
    .describe('List of trade identifiers to update (minimum 1 item).'),
  strategyId: z
    .string()
    .uuid()
    .optional()
    .describe('Optional strategy identifier to assign to selected trades.'),
  tagIds: z
    .array(z.string().uuid().describe('Tag identifier in UUID format.'))
    .optional()
    .describe('Optional tag identifiers to assign to selected trades.'),
});

export const tradeIdParamSchema = z.object({
  id: z.string().uuid().describe('Trade identifier in UUID format.'),
});

export const tradeAttachmentIdParamSchema = z.object({
  id: z.string().uuid().describe('Trade attachment identifier in UUID format.'),
});

export class TradeCreateDto extends createZodDto(tradeCreateSchema) {}

export class TradeUpdateDto extends createZodDto(tradeUpdateSchema) {}

export class TradeListQueryDto extends createZodDto(tradeListQuerySchema) {}

export class TradeBulkDto extends createZodDto(tradeBulkSchema) {}

export class TradeIdParamDto extends createZodDto(tradeIdParamSchema) {}

export class TradeAttachmentIdParamDto extends createZodDto(
  tradeAttachmentIdParamSchema,
) {}
