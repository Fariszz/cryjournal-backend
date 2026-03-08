import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import {
  strategies,
  strategyConfluences,
  strategySteps,
  trades,
} from '../../db/schema';
import type {
  StrategyCreateDto,
  StrategyUpdateDto,
} from './strategies.schemas';
import type { ActionSuccessResponse } from './interfaces/action-success.response';
import type { StrategyAnalyticsResponse } from './interfaces/strategy-analytics.response';
import type { StrategyConfluenceResponse } from './interfaces/strategy-confluence.response';
import type { StrategyDetailResponse } from './interfaces/strategy-detail.response';
import type { StrategyResponse } from './interfaces/strategy.response';

@Injectable()
export class StrategiesService {
  constructor(@InjectDb() private readonly db: DB) {}

  async list(): Promise<StrategyResponse[]> {
    return this.db.select().from(strategies);
  }

  async create(input: StrategyCreateDto) {
    const [strategy] = await this.db
      .insert(strategies)
      .values({
        name: input.name,
        description: input.description,
        tags: input.tags,
        playbookScoreSchema: input.playbookScoreSchema,
      })
      .returning();

    if (input.steps.length > 0) {
      await this.db.insert(strategySteps).values(
        input.steps.map((step) => ({
          strategyId: strategy.id,
          stepIndex: step.stepIndex,
          title: step.title,
          description: step.description,
        })),
      );
    }

    if (input.confluences.length > 0) {
      await this.db.insert(strategyConfluences).values(
        input.confluences.map((conf) => ({
          strategyId: strategy.id,
          name: conf.name,
          impactWeight: conf.impactWeight.toString(),
          ruleType: conf.ruleType,
          ruleConfig: conf.ruleConfig,
          sortOrder: conf.sortOrder ?? 0,
        })),
      );
    }

    return this.getById(strategy.id);
  }

  async getById(id: string): Promise<StrategyDetailResponse> {
    const [strategy] = await this.db
      .select()
      .from(strategies)
      .where(eq(strategies.id, id));
    if (!strategy) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Strategy not found',
      });
    }
    const [steps, confluences] = await Promise.all([
      this.db
        .select()
        .from(strategySteps)
        .where(eq(strategySteps.strategyId, id))
        .orderBy(strategySteps.stepIndex),
      this.db
        .select()
        .from(strategyConfluences)
        .where(eq(strategyConfluences.strategyId, id))
        .orderBy(strategyConfluences.sortOrder),
    ]);

    return {
      ...strategy,
      steps,
      confluences,
    };
  }

  async update(id: string, input: StrategyUpdateDto) {
    const [updated] = await this.db
      .update(strategies)
      .set({
        name: input.name,
        description: input.description,
        tags: input.tags,
        playbookScoreSchema: input.playbookScoreSchema,
        updatedAt: new Date(),
      })
      .where(eq(strategies.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Strategy not found',
      });
    }

    if (input.steps) {
      await this.db
        .delete(strategySteps)
        .where(eq(strategySteps.strategyId, id));
      if (input.steps.length > 0) {
        await this.db.insert(strategySteps).values(
          input.steps.map((step) => ({
            strategyId: id,
            stepIndex: step.stepIndex,
            title: step.title,
            description: step.description,
          })),
        );
      }
    }

    if (input.confluences) {
      await this.db
        .delete(strategyConfluences)
        .where(eq(strategyConfluences.strategyId, id));
      if (input.confluences.length > 0) {
        await this.db.insert(strategyConfluences).values(
          input.confluences.map((conf) => ({
            strategyId: id,
            name: conf.name,
            impactWeight: conf.impactWeight.toString(),
            ruleType: conf.ruleType,
            ruleConfig: conf.ruleConfig,
            sortOrder: conf.sortOrder ?? 0,
          })),
        );
      }
    }

    return this.getById(id);
  }

  async remove(id: string): Promise<ActionSuccessResponse> {
    const [linked] = await this.db
      .select({ id: trades.id })
      .from(trades)
      .where(eq(trades.strategyId, id))
      .limit(1);

    if (linked) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Strategy is used by existing trades',
      });
    }

    await this.db.delete(strategies).where(eq(strategies.id, id));
    return { success: true };
  }

  async analytics(id: string): Promise<StrategyAnalyticsResponse> {
    const [summary] = await this.db
      .select({
        tradesCount: sql<number>`count(*)`,
        netPnl: sql<string>`coalesce(sum(${trades.pnl}), 0)`,
        winCount: sql<number>`coalesce(sum(case when ${trades.winLossFlag} = 'win' then 1 else 0 end), 0)`,
      })
      .from(trades)
      .where(and(eq(trades.strategyId, id), eq(trades.type, 'executed')));

    const recentTrades = await this.db
      .select({
        id: trades.id,
        accountId: trades.accountId,
        instrumentId: trades.instrumentId,
        pnl: trades.pnl,
        entryDatetime: trades.entryDatetime,
      })
      .from(trades)
      .where(eq(trades.strategyId, id))
      .orderBy(desc(trades.entryDatetime))
      .limit(25);

    return {
      kpis: {
        trades_count: Number(summary?.tradesCount ?? 0),
        net_pnl: Number(summary?.netPnl ?? 0),
        win_rate:
          Number(summary?.tradesCount ?? 0) > 0
            ? Number(summary?.winCount ?? 0) / Number(summary?.tradesCount ?? 0)
            : 0,
      },
      trades: recentTrades,
    };
  }

  async getConfluences(
    strategyId: string,
  ): Promise<StrategyConfluenceResponse[]> {
    return this.db
      .select()
      .from(strategyConfluences)
      .where(eq(strategyConfluences.strategyId, strategyId))
      .orderBy(strategyConfluences.sortOrder);
  }
}
