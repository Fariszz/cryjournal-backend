import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { accounts, dailyJournals, instruments, trades } from '../../db/schema';
import { InstrumentsService } from '../instruments/instruments.service';
import { TradesService } from '../trades/trades.service';
import { parseCsv, toCsv } from './csv.util';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectDb() private readonly db: DB,
    private readonly instrumentsService: InstrumentsService,
    private readonly tradesService: TradesService,
  ) {}

  async importTradesCsv(content: string) {
    const rows = parseCsv(content);
    const imported: string[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, row] of rows.entries()) {
      try {
        const [account] = await this.db
          .select()
          .from(accounts)
          .where(eq(accounts.name, row.account_name));
        if (!account) {
          throw new Error(`Unknown account: ${row.account_name}`);
        }
        const instrument = await this.instrumentsService.ensureBySymbol(
          row.symbol,
          row.category || 'unknown',
        );

        const timezone = row.timezone || account.timezone || 'Asia/Jakarta';
        const created = await this.tradesService.create({
          accountId: account.id,
          type: (row.type as 'executed' | 'missed') ?? 'executed',
          instrumentId: instrument.id,
          direction: (row.direction as 'long' | 'short') ?? 'long',
          timezone,
          entryDatetime: new Date(row.entry_datetime).toISOString(),
          exitDatetime: row.exit_datetime
            ? new Date(row.exit_datetime).toISOString()
            : undefined,
          entryPrice: row.entry_price ? Number(row.entry_price) : undefined,
          exitPrice: row.exit_price ? Number(row.exit_price) : undefined,
          stopLoss: row.stop_loss ? Number(row.stop_loss) : undefined,
          takeProfit: row.take_profit ? Number(row.take_profit) : undefined,
          dollarRisk: row.dollar_risk ? Number(row.dollar_risk) : undefined,
          positionSize: row.position_size
            ? Number(row.position_size)
            : undefined,
          notes: row.notes || undefined,
          entryTimeframe: row.entry_timeframe || undefined,
          tradingSession: row.trading_session || undefined,
        });
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

  async exportTradesCsv(input: { dateFrom?: string; dateTo?: string }) {
    const conditions = [isNull(trades.deletedAt)];
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

    return toCsv(rows as Array<Record<string, unknown>>);
  }

  async exportJournalsCsv(input: { dateFrom?: string; dateTo?: string }) {
    const conditions = [isNull(dailyJournals.deletedAt)];
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

    return toCsv(rows as Array<Record<string, unknown>>);
  }
}
