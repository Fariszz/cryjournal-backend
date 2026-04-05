import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { z } from 'zod';
import { TradeDirectionEnum } from '@common/enums/trade-direction.enum';
import { TradeTypeEnum } from '@common/enums/trade-type.enum';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { accounts, dailyJournals, trades } from '../../db/schema';
import { InstrumentsService } from '../instruments/instruments.service';
import { TradesService } from '../trades/trades.service';
import { parseCsv, toCsv } from './csv.util';

const optionalNumberSchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}, z.coerce.number().optional().describe('Optional numeric value from CSV cell.'));

const optionalStringSchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}, z.string().optional().describe('Optional string value from CSV cell.'));

const datetimeStringSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'must be a valid datetime string',
  })
  .describe('Date-time string that can be parsed into a valid date.');

const optionalDatetimeStringSchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}, datetimeStringSchema.optional().describe('Optional date-time string from CSV cell.'));

const csvTradeRowSchema = z.object({
  account_name: z
    .string()
    .min(1)
    .describe(
      'Account name mapped to an existing account (minimum 1 character).',
    ),
  symbol: z
    .string()
    .min(1)
    .describe('Instrument symbol (minimum 1 character).'),
  category: optionalStringSchema,
  type: z
    .string()
    .optional()
    .transform((value) => value?.toLowerCase() ?? TradeTypeEnum.EXECUTED)
    .pipe(z.enum(TradeTypeEnum))
    .describe('Trade type value normalized from CSV input.'),
  direction: z
    .string()
    .optional()
    .transform((value) => value?.toLowerCase() ?? TradeDirectionEnum.LONG)
    .pipe(z.enum(TradeDirectionEnum))
    .describe('Trade direction value normalized from CSV input.'),
  timezone: optionalStringSchema,
  entry_datetime: datetimeStringSchema,
  exit_datetime: optionalDatetimeStringSchema,
  entry_price: optionalNumberSchema,
  exit_price: optionalNumberSchema,
  stop_loss: optionalNumberSchema,
  take_profit: optionalNumberSchema,
  dollar_risk: optionalNumberSchema,
  position_size: optionalNumberSchema,
  notes: optionalStringSchema,
  entry_timeframe: optionalStringSchema,
  trading_session: optionalStringSchema,
});

@Injectable()
export class ImportExportService {
  constructor(
    @InjectDb() private readonly db: DB,
    private readonly instrumentsService: InstrumentsService,
    private readonly tradesService: TradesService,
  ) {}

  async importTradesCsv(content: string, userId: string) {
    const rows = parseCsv(content);
    const imported: string[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, row] of rows.entries()) {
      try {
        const parsedRow = csvTradeRowSchema.safeParse(row);
        if (!parsedRow.success) {
          errors.push({
            row: index + 2,
            message: parsedRow.error.issues
              .map((issue) => issue.message)
              .join(', '),
          });
          continue;
        }
        const value = parsedRow.data;

        const [account] = await this.db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.name, value.account_name),
              eq(accounts.userId, userId),
            ),
          );
        if (!account) {
          throw new Error(`Unknown account: ${value.account_name}`);
        }
        const instrument = await this.instrumentsService.ensureBySymbol(
          value.symbol,
          userId,
          value.category ?? 'unknown',
        );

        const timezone = value.timezone ?? account.timezone;
        const created = await this.tradesService.create(
          {
            accountId: account.id,
            type: value.type,
            instrumentId: instrument.id,
            direction: value.direction,
            timezone,
            entryDatetime: new Date(value.entry_datetime).toISOString(),
            exitDatetime: value.exit_datetime
              ? new Date(value.exit_datetime).toISOString()
              : undefined,
            entryPrice: value.entry_price,
            exitPrice: value.exit_price,
            stopLoss: value.stop_loss,
            takeProfit: value.take_profit,
            dollarRisk: value.dollar_risk,
            positionSize: value.position_size,
            notes: value.notes,
            entryTimeframe: value.entry_timeframe,
            tradingSession: value.trading_session,
          },
          userId,
        );
        imported.push(created.trade.id);
      } catch (error) {
        errors.push({
          row: index + 2,
          message:
            error instanceof Error ? error.message : 'Unknown import error',
        });
      }
    }

    return {
      imported_count: imported.length,
      errors,
    };
  }

  async exportTradesCsv(input: {
    userId: string;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
  }) {
    const conditions = [
      eq(trades.userId, input.userId),
      isNull(trades.deletedAt),
    ];
    if (input.dateFrom) {
      conditions.push(gte(trades.entryDatetime, new Date(input.dateFrom)));
    }
    if (input.dateTo) {
      conditions.push(lte(trades.entryDatetime, new Date(input.dateTo)));
    }

    const rows = await this.db
      .select({
        id: trades.id,
        account_id: trades.accountId,
        instrument_id: trades.instrumentId,
        type: trades.type,
        direction: trades.direction,
        entry_datetime: trades.entryDatetime,
        exit_datetime: trades.exitDatetime,
        entry_price: trades.entryPrice,
        exit_price: trades.exitPrice,
        pnl: trades.pnl,
        notes: trades.notes,
      })
      .from(trades)
      .where(and(...conditions))
      .orderBy(desc(trades.entryDatetime));

    return toCsv(rows.map((row) => ({ ...row })));
  }

  async exportJournalsCsv(input: {
    userId: string;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
  }) {
    const conditions = [
      eq(dailyJournals.userId, input.userId),
      isNull(dailyJournals.deletedAt),
    ];
    if (input.dateFrom) {
      conditions.push(gte(dailyJournals.date, input.dateFrom));
    }
    if (input.dateTo) {
      conditions.push(lte(dailyJournals.date, input.dateTo));
    }

    const rows = await this.db
      .select({
        id: dailyJournals.id,
        date: dailyJournals.date,
        account_id: dailyJournals.accountId,
        mood: dailyJournals.mood,
        energy: dailyJournals.energy,
        focus: dailyJournals.focus,
        confidence: dailyJournals.confidence,
        plan: dailyJournals.plan,
        execution_notes: dailyJournals.executionNotes,
        lessons: dailyJournals.lessons,
        next_actions: dailyJournals.nextActions,
      })
      .from(dailyJournals)
      .where(and(...conditions))
      .orderBy(desc(dailyJournals.date));

    return toCsv(rows.map((row) => ({ ...row })));
  }
}
