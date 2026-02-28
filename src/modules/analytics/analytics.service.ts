import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { accounts, instruments, trades } from '../../db/schema';

function variance(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
  return values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
}

function maxDrawdown(values: number[]): number {
  let peak = Number.NEGATIVE_INFINITY;
  let maxDd = 0;
  for (const value of values) {
    peak = Math.max(peak, value);
    maxDd = Math.max(maxDd, peak - value);
  }
  return maxDd;
}

@Injectable()
export class AnalyticsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async home(input: { dateFrom: string; dateTo: string; accountId?: string }) {
    const conditions = [
      eq(trades.type, 'executed'),
      isNull(trades.deletedAt),
      gte(trades.entryDatetime, new Date(input.dateFrom)),
      lte(trades.entryDatetime, new Date(input.dateTo)),
    ];
    if (input.accountId) {
      conditions.push(eq(trades.accountId, input.accountId));
    }
    const where = and(...conditions);

    const [summary] = await this.db
      .select({
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        grossProfit: sql<string>`coalesce(sum(case when ${trades.pnl} > 0 then ${trades.pnl} else 0 end), 0)`,
        grossLoss: sql<string>`coalesce(sum(case when ${trades.pnl} < 0 then ${trades.pnl} else 0 end), 0)`,
        totalTrades: sql<number>`count(*)`,
        wins: sql<number>`coalesce(sum(case when ${trades.winLossFlag} = 'win' then 1 else 0 end), 0)`,
        avgWin: sql<string>`coalesce(avg(case when ${trades.pnl} > 0 then ${trades.pnl} end), 0)`,
        avgLoss: sql<string>`coalesce(avg(case when ${trades.pnl} < 0 then ${trades.pnl} end), 0)`,
      })
      .from(trades)
      .where(where);

    const dailyRows = await this.db
      .select({
        date: sql<string>`date(${trades.entryDatetime})`,
        pnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
      })
      .from(trades)
      .where(where)
      .groupBy(sql`date(${trades.entryDatetime})`)
      .orderBy(asc(sql`date(${trades.entryDatetime})`));

    let equity = 0;
    const equityCurve = dailyRows.map((row) => {
      equity += Number(row.pnl ?? 0);
      return {
        date: row.date,
        equity,
        pnl: Number(row.pnl ?? 0),
      };
    });

    const sessionRows = await this.db
      .select({
        session: trades.tradingSession,
        trades: sql<number>`count(*)`,
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        wins: sql<number>`coalesce(sum(case when ${trades.winLossFlag} = 'win' then 1 else 0 end), 0)`,
      })
      .from(trades)
      .where(where)
      .groupBy(trades.tradingSession);

    const sessionBreakdown = sessionRows.map((row) => ({
      session: row.session ?? 'unknown',
      trades: Number(row.trades ?? 0),
      net_pnl: Number(row.netPnl ?? 0),
      win_rate:
        Number(row.trades ?? 0) > 0
          ? Number(row.wins ?? 0) / Number(row.trades ?? 0)
          : 0,
    }));

    const recent = await this.db
      .select({
        trade_id: trades.id,
        symbol: instruments.symbol,
        pnl: trades.pnl,
        entry_datetime: trades.entryDatetime,
      })
      .from(trades)
      .leftJoin(instruments, eq(instruments.id, trades.instrumentId))
      .where(where)
      .orderBy(desc(trades.entryDatetime))
      .limit(10);

    const grossProfit = Number(summary?.grossProfit ?? 0);
    const grossLoss = Math.abs(Number(summary?.grossLoss ?? 0));
    const pnlSeries = dailyRows.map((row) => Number(row.pnl ?? 0));

    return {
      summary: {
        net_pnl: Number(summary?.netPnl ?? 0),
        gross_profit: grossProfit,
        gross_loss: grossLoss,
        profit_factor: grossLoss === 0 ? grossProfit : grossProfit / grossLoss,
        win_rate:
          Number(summary?.totalTrades ?? 0) > 0
            ? Number(summary?.wins ?? 0) / Number(summary?.totalTrades ?? 0)
            : 0,
        avg_win: Number(summary?.avgWin ?? 0),
        avg_loss: Number(summary?.avgLoss ?? 0),
        consistency_rating: 1 / (1 + variance(pnlSeries)),
        max_drawdown: maxDrawdown(equityCurve.map((row) => row.equity)),
      },
      equity_curve: equityCurve,
      session_breakdown: sessionBreakdown,
      recent_trades: recent.map((row) => ({
        trade_id: row.trade_id,
        symbol: row.symbol ?? 'unknown',
        pnl: Number(row.pnl ?? 0),
        entry_datetime: row.entry_datetime,
      })),
    };
  }

  async accountOverview(
    id: string,
    input: { dateFrom: string; dateTo: string },
  ) {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    if (!account) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }

    const where = and(
      eq(trades.accountId, id),
      isNull(trades.deletedAt),
      gte(trades.entryDatetime, new Date(input.dateFrom)),
      lte(trades.entryDatetime, new Date(input.dateTo)),
    );

    const [summary] = await this.db
      .select({
        tradesCount: sql<number>`count(*)`,
        executedCount: sql<number>`coalesce(sum(case when ${trades.type} = 'executed' then 1 else 0 end), 0)`,
        missedCount: sql<number>`coalesce(sum(case when ${trades.type} = 'missed' then 1 else 0 end), 0)`,
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        wins: sql<number>`coalesce(sum(case when ${trades.winLossFlag} = 'win' then 1 else 0 end), 0)`,
        avgR: sql<string>`coalesce(avg(${trades.rMultiple}), 0)`,
        grossProfit: sql<string>`coalesce(sum(case when ${trades.pnl} > 0 then ${trades.pnl} else 0 end), 0)`,
        grossLoss: sql<string>`coalesce(sum(case when ${trades.pnl} < 0 then ${trades.pnl} else 0 end), 0)`,
      })
      .from(trades)
      .where(where);

    const pnlCalendar = await this.db
      .select({
        date: sql<string>`date(${trades.entryDatetime})`,
        pnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        trades: sql<number>`count(*)`,
      })
      .from(trades)
      .where(where)
      .groupBy(sql`date(${trades.entryDatetime})`)
      .orderBy(asc(sql`date(${trades.entryDatetime})`));

    let runningEquity = 0;
    const equitySeries = pnlCalendar.map((row) => {
      runningEquity += Number(row.pnl);
      return runningEquity;
    });

    const grossProfit = Number(summary?.grossProfit ?? 0);
    const grossLossAbs = Math.abs(Number(summary?.grossLoss ?? 0));

    return {
      account: {
        id: account.id,
        name: account.name,
        account_type: account.accountType,
        base_currency: account.baseCurrency,
        timezone: account.timezone,
      },
      kpis: {
        trades_count: Number(summary?.tradesCount ?? 0),
        executed_count: Number(summary?.executedCount ?? 0),
        missed_count: Number(summary?.missedCount ?? 0),
        net_pnl: Number(summary?.netPnl ?? 0),
        win_rate:
          Number(summary?.executedCount ?? 0) > 0
            ? Number(summary?.wins ?? 0) / Number(summary?.executedCount ?? 0)
            : 0,
        avg_r: Number(summary?.avgR ?? 0),
        profit_factor:
          grossLossAbs === 0 ? grossProfit : grossProfit / grossLossAbs,
        max_drawdown: maxDrawdown(equitySeries),
      },
      pnl_calendar: pnlCalendar.map((row) => ({
        date: row.date,
        pnl: Number(row.pnl),
        trades: Number(row.trades),
      })),
    };
  }

  async accountInstruments(
    id: string,
    input: { dateFrom: string; dateTo: string; page: number; pageSize: number },
  ) {
    const where = and(
      eq(trades.accountId, id),
      isNull(trades.deletedAt),
      gte(trades.entryDatetime, new Date(input.dateFrom)),
      lte(trades.entryDatetime, new Date(input.dateTo)),
      eq(trades.type, 'executed'),
    );

    const rows = await this.db
      .select({
        instrumentId: trades.instrumentId,
        symbol: instruments.symbol,
        tradesCount: sql<number>`count(*)`,
        wins: sql<number>`coalesce(sum(case when ${trades.winLossFlag} = 'win' then 1 else 0 end), 0)`,
        expectancy: sql<string>`coalesce(avg(${trades.pnl}), 0)`,
        profitFactor: sql<string>`case
          when abs(sum(case when ${trades.pnl} < 0 then ${trades.pnl} else 0 end)) = 0
          then sum(case when ${trades.pnl} > 0 then ${trades.pnl} else 0 end)
          else sum(case when ${trades.pnl} > 0 then ${trades.pnl} else 0 end) / abs(sum(case when ${trades.pnl} < 0 then ${trades.pnl} else 0 end))
        end`,
        avgR: sql<string>`coalesce(avg(${trades.rMultiple}), 0)`,
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
      })
      .from(trades)
      .leftJoin(instruments, eq(instruments.id, trades.instrumentId))
      .where(where)
      .groupBy(trades.instrumentId, instruments.symbol)
      .orderBy(desc(sql`coalesce(sum(${trades.pnl}), 0)`))
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize);

    const [total] = await this.db
      .select({ count: sql<number>`count(distinct ${trades.instrumentId})` })
      .from(trades)
      .where(where);

    return {
      rows: rows.map((row) => ({
        instrument_id: row.instrumentId,
        symbol: row.symbol ?? 'unknown',
        trades: Number(row.tradesCount ?? 0),
        win_rate:
          Number(row.tradesCount ?? 0) > 0
            ? Number(row.wins ?? 0) / Number(row.tradesCount ?? 0)
            : 0,
        expectancy: Number(row.expectancy ?? 0),
        profit_factor: Number(row.profitFactor ?? 0),
        avg_r: Number(row.avgR ?? 0),
        max_drawdown: 0,
        tp_capture_ratio: 0,
        net_pnl: Number(row.netPnl ?? 0),
      })),
      meta: {
        page: input.page,
        page_size: input.pageSize,
        total: Number(total?.count ?? 0),
      },
    };
  }

  async accountSessions(
    id: string,
    input: { dateFrom: string; dateTo: string },
  ) {
    const rows = await this.db
      .select({
        session: trades.tradingSession,
        trades: sql<number>`count(*)`,
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        wins: sql<number>`coalesce(sum(case when ${trades.winLossFlag} = 'win' then 1 else 0 end), 0)`,
      })
      .from(trades)
      .where(
        and(
          eq(trades.accountId, id),
          isNull(trades.deletedAt),
          gte(trades.entryDatetime, new Date(input.dateFrom)),
          lte(trades.entryDatetime, new Date(input.dateTo)),
          eq(trades.type, 'executed'),
        ),
      )
      .groupBy(trades.tradingSession);

    return rows.map((row) => ({
      session: row.session ?? 'unknown',
      trades: Number(row.trades ?? 0),
      net_pnl: Number(row.netPnl ?? 0),
      win_rate:
        Number(row.trades ?? 0) > 0
          ? Number(row.wins ?? 0) / Number(row.trades ?? 0)
          : 0,
    }));
  }

  async accountEntryTimeHeatmap(
    id: string,
    input: { dateFrom: string; dateTo: string },
  ) {
    const rows = await this.db
      .select({
        hour: sql<number>`extract(hour from ${trades.entryDatetime})`,
        trades: sql<number>`count(*)`,
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
      })
      .from(trades)
      .where(
        and(
          eq(trades.accountId, id),
          isNull(trades.deletedAt),
          gte(trades.entryDatetime, new Date(input.dateFrom)),
          lte(trades.entryDatetime, new Date(input.dateTo)),
          eq(trades.type, 'executed'),
        ),
      )
      .groupBy(sql`extract(hour from ${trades.entryDatetime})`)
      .orderBy(asc(sql`extract(hour from ${trades.entryDatetime})`));

    return rows.map((row) => ({
      hour: Number(row.hour ?? 0),
      trades: Number(row.trades ?? 0),
      net_pnl: Number(row.netPnl ?? 0),
    }));
  }

  async accountPnlCalendar(id: string, input: { month?: string }) {
    const month = input.month ?? new Date().toISOString().slice(0, 7);
    const rows = await this.db
      .select({
        date: sql<string>`date(${trades.entryDatetime})`,
        pnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        trades: sql<number>`count(*)`,
      })
      .from(trades)
      .where(
        and(
          eq(trades.accountId, id),
          isNull(trades.deletedAt),
          sql`to_char(${trades.entryDatetime}, 'YYYY-MM') = ${month}`,
        ),
      )
      .groupBy(sql`date(${trades.entryDatetime})`)
      .orderBy(asc(sql`date(${trades.entryDatetime})`));

    return rows.map((row) => ({
      date: row.date,
      pnl: Number(row.pnl ?? 0),
      trades: Number(row.trades ?? 0),
    }));
  }

  async accountRecentTrades(id: string, limit: number) {
    return this.db
      .select()
      .from(trades)
      .where(and(eq(trades.accountId, id), isNull(trades.deletedAt)))
      .orderBy(desc(trades.entryDatetime))
      .limit(limit);
  }
}
