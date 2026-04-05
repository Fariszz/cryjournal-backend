import { Transactional } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import { AccountTypeEnum } from '@common/enums/account-type.enum';
import { TradeDirectionEnum } from '@common/enums/trade-direction.enum';
import { TradeMarginModeEnum } from '@common/enums/trade-margin-mode.enum';
import { TradePositionSizeUnitEnum } from '@common/enums/trade-position-size-unit.enum';
import { TradePositionTypeEnum } from '@common/enums/trade-position-type.enum';
import { TradeTypeEnum } from '@common/enums/trade-type.enum';
import { STORAGE_PROVIDER } from '../../common/storage/storage.provider';
import type { StorageProvider } from '../../common/storage/storage.provider';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import {
  accounts,
  instruments,
  tradeAttachments,
  tradeConfluenceChecks,
  tradeDemonPivot,
  tradeMarketConditionPivot,
  tradeMarketConditionTagPivot,
  tradeTagPivot,
  trades,
} from '../../db/schema';
import { StrategiesService } from '../strategies/strategies.service';
import {
  computeDecisionQualityScore,
  computeHoldingBucket,
  computeHoldingSeconds,
  computePnl,
  computeRMultiple,
  computeWinLossFlag,
} from './trade-metrics.util';
import type {
  TradeBulkDto,
  TradeCreateDto,
  TradeUpdateDto,
} from './trades.schemas';
import type { TradeDetailResponse } from './interfaces/trade-detail.response';
import type { TradesListResponse } from './interfaces/trades-list.response';
import type { TradeResponse } from './interfaces/trade.response';

interface TradeInput {
  accountId: string;
  type: TradeTypeEnum;
  instrumentId: string;
  direction: TradeDirectionEnum;
  timezone: string;
  entryDatetime: string;
  exitDatetime?: string | undefined;
  entryTimeframe?: string | undefined;
  tradingSession?: string | undefined;
  entryPrice?: number | undefined;
  exitPrice?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  dollarRisk?: number | undefined;
  positionSize?: number | undefined;
  positionSizeUnit?: TradePositionSizeUnitEnum | undefined;
  brokerCommission?: number | undefined;
  swap?: number | undefined;
  fundingFee?: number | undefined;
  positionType?: TradePositionTypeEnum | undefined;
  leverage?: number | undefined;
  marginMode?: TradeMarginModeEnum | undefined;
  strategyId?: string | undefined;
  thesis?: string | undefined;
  postAnalysis?: string | undefined;
  notes?: string | undefined;
  tagIds?: string[] | undefined;
  demonIds?: string[] | undefined;
  marketConditionTagIds?: string[] | undefined;
  marketConditionIds?: string[] | undefined;
  confluenceChecks?:
    | Array<{ confluenceId: string; checked: boolean }>
    | undefined;
}

@Injectable()
export class TradesService {
  constructor(
    @InjectDb() private readonly db: DB,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly strategiesService: StrategiesService,
  ) {}

  @Transactional()
  async create(input: TradeCreateDto, userId: string) {
    const account = await this.validateTradeInput(input, userId);
    const metricInput = this.buildMetricInput(input);
    const baseMetrics = this.computeMetrics(metricInput);
    const [created] = await this.db
      .insert(trades)
      .values({
        userId,
        accountId: input.accountId,
        type: input.type,
        instrumentId: input.instrumentId,
        direction: input.direction,
        timezone: input.timezone,
        entryDatetime: new Date(input.entryDatetime),
        exitDatetime: input.exitDatetime
          ? new Date(input.exitDatetime)
          : undefined,
        entryTimeframe: input.entryTimeframe,
        tradingSession: input.tradingSession,
        entryPrice: input.entryPrice?.toString(),
        exitPrice: input.exitPrice?.toString(),
        stopLoss: input.stopLoss?.toString(),
        takeProfit: input.takeProfit?.toString(),
        dollarRisk: input.dollarRisk?.toString(),
        positionSize: input.positionSize?.toString(),
        positionSizeUnit: input.positionSizeUnit,
        brokerCommission: input.brokerCommission?.toString(),
        swap: input.swap?.toString(),
        fundingFee: input.fundingFee?.toString(),
        positionType: input.positionType,
        leverage: input.leverage?.toString(),
        marginMode: input.marginMode,
        strategyId: input.strategyId,
        thesis: input.thesis,
        postAnalysis: input.postAnalysis,
        notes: input.notes,
        pnl: baseMetrics.pnl?.toString(),
        rMultiple: baseMetrics.rMultiple?.toString(),
        winLossFlag: baseMetrics.winLossFlag,
        holdingTimeSeconds: baseMetrics.holdingTimeSeconds,
        holdingBucket: baseMetrics.holdingBucket,
      })
      .returning();

    const checks = await this.syncConfluenceChecks(
      created.id,
      userId,
      input.strategyId,
      input.confluenceChecks,
    );
    const decisionQuality = computeDecisionQualityScore(
      checks.map((row) => ({
        checked: Boolean(row.checked),
        weight: Number(row.weightSnapshot),
      })),
    );
    if (decisionQuality !== null) {
      await this.db
        .update(trades)
        .set({
          decisionQualityScore: decisionQuality.toString(),
          updatedAt: new Date(),
        })
        .where(and(eq(trades.id, created.id), eq(trades.userId, userId)));
    }

    await this.syncTradeLinks(created.id, input);

    const result = {
      tradeId: created.id,
      warnings: this.buildWarnings(input, account.timezone),
    };

    const trade = await this.getById(result.tradeId, userId);
    return {
      trade,
      warnings: result.warnings,
    };
  }

  @Transactional()
  async update(id: string, input: TradeUpdateDto, userId: string) {
    const existing = await this.mustGetTrade(id, userId);
    const parseOptionalNumber = (value: string | null): number | undefined => {
      return value === null ? undefined : Number(value);
    };

    const merged: TradeInput = {
      accountId: input.accountId ?? existing.accountId,
      type: input.type ?? existing.type,
      instrumentId: input.instrumentId ?? existing.instrumentId,
      direction: input.direction ?? existing.direction,
      timezone: input.timezone ?? existing.timezone,
      entryDatetime:
        input.entryDatetime ?? new Date(existing.entryDatetime).toISOString(),
      exitDatetime:
        input.exitDatetime ??
        (existing.exitDatetime
          ? new Date(existing.exitDatetime).toISOString()
          : undefined),
      entryTimeframe:
        input.entryTimeframe ?? existing.entryTimeframe ?? undefined,
      tradingSession:
        input.tradingSession ?? existing.tradingSession ?? undefined,
      entryPrice: input.entryPrice ?? parseOptionalNumber(existing.entryPrice),
      exitPrice: input.exitPrice ?? parseOptionalNumber(existing.exitPrice),
      stopLoss: input.stopLoss ?? parseOptionalNumber(existing.stopLoss),
      takeProfit: input.takeProfit ?? parseOptionalNumber(existing.takeProfit),
      dollarRisk: input.dollarRisk ?? parseOptionalNumber(existing.dollarRisk),
      positionSize:
        input.positionSize ?? parseOptionalNumber(existing.positionSize),
      positionSizeUnit:
        input.positionSizeUnit ?? existing.positionSizeUnit ?? undefined,
      brokerCommission:
        input.brokerCommission ??
        parseOptionalNumber(existing.brokerCommission),
      swap: input.swap ?? parseOptionalNumber(existing.swap),
      fundingFee: input.fundingFee ?? parseOptionalNumber(existing.fundingFee),
      positionType: input.positionType ?? existing.positionType ?? undefined,
      leverage: input.leverage ?? parseOptionalNumber(existing.leverage),
      marginMode: input.marginMode ?? existing.marginMode ?? undefined,
      strategyId: input.strategyId ?? existing.strategyId ?? undefined,
      thesis: input.thesis ?? existing.thesis ?? undefined,
      postAnalysis: input.postAnalysis ?? existing.postAnalysis ?? undefined,
      notes: input.notes ?? existing.notes ?? undefined,
      tagIds: input.tagIds,
      demonIds: input.demonIds,
      marketConditionTagIds: input.marketConditionTagIds,
      marketConditionIds: input.marketConditionIds,
      confluenceChecks: input.confluenceChecks,
    };

    const account = await this.validateTradeInput(merged, userId);
    const metricInput = this.buildMetricInput(merged);
    const metrics = this.computeMetrics(metricInput);

    await this.db
      .update(trades)
      .set({
        accountId: merged.accountId,
        type: merged.type,
        instrumentId: merged.instrumentId,
        direction: merged.direction,
        timezone: merged.timezone,
        entryDatetime: new Date(merged.entryDatetime),
        exitDatetime: merged.exitDatetime
          ? new Date(merged.exitDatetime)
          : null,
        entryTimeframe: merged.entryTimeframe,
        tradingSession: merged.tradingSession,
        entryPrice: merged.entryPrice?.toString(),
        exitPrice: merged.exitPrice?.toString(),
        stopLoss: merged.stopLoss?.toString(),
        takeProfit: merged.takeProfit?.toString(),
        dollarRisk: merged.dollarRisk?.toString(),
        positionSize: merged.positionSize?.toString(),
        positionSizeUnit: merged.positionSizeUnit,
        brokerCommission: merged.brokerCommission?.toString(),
        swap: merged.swap?.toString(),
        fundingFee: merged.fundingFee?.toString(),
        positionType: merged.positionType,
        leverage: merged.leverage?.toString(),
        marginMode: merged.marginMode,
        strategyId: merged.strategyId,
        thesis: merged.thesis,
        postAnalysis: merged.postAnalysis,
        notes: merged.notes,
        pnl: metrics.pnl?.toString(),
        rMultiple: metrics.rMultiple?.toString(),
        winLossFlag: metrics.winLossFlag,
        holdingTimeSeconds: metrics.holdingTimeSeconds,
        holdingBucket: metrics.holdingBucket,
        updatedAt: new Date(),
      })
      .where(and(eq(trades.id, id), eq(trades.userId, userId)));

    if (
      input.strategyId !== undefined ||
      input.confluenceChecks !== undefined
    ) {
      const checks = await this.syncConfluenceChecks(
        id,
        userId,
        merged.strategyId,
        input.confluenceChecks,
      );
      const score = computeDecisionQualityScore(
        checks.map((row) => ({
          checked: Boolean(row.checked),
          weight: Number(row.weightSnapshot),
        })),
      );
      await this.db
        .update(trades)
        .set({
          decisionQualityScore: score === null ? null : score.toString(),
          updatedAt: new Date(),
        })
        .where(and(eq(trades.id, id), eq(trades.userId, userId)));
    }

    if (
      input.tagIds !== undefined ||
      input.demonIds !== undefined ||
      input.marketConditionIds !== undefined ||
      input.marketConditionTagIds !== undefined
    ) {
      await this.syncTradeLinks(id, input);
    }

    const result = {
      tradeId: id,
      warnings: this.buildWarnings(merged, account.timezone),
    };

    const trade = await this.getById(result.tradeId, userId);
    return {
      trade,
      warnings: result.warnings,
    };
  }

  async list(input: {
    userId: string;
    accountId?: string | undefined;
    instrumentId?: string | undefined;
    strategyId?: string | undefined;
    type?: TradeTypeEnum | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    session?: string | undefined;
    tags?: string[] | undefined;
    demons?: string[] | undefined;
    page: number;
    pageSize: number;
  }): Promise<TradesListResponse> {
    const conditions = [
      eq(trades.userId, input.userId),
      isNull(trades.deletedAt),
    ];
    if (input.accountId) {
      conditions.push(eq(trades.accountId, input.accountId));
    }
    if (input.instrumentId) {
      conditions.push(eq(trades.instrumentId, input.instrumentId));
    }
    if (input.strategyId) {
      conditions.push(eq(trades.strategyId, input.strategyId));
    }
    if (input.type) {
      conditions.push(eq(trades.type, input.type));
    }
    if (input.session) {
      conditions.push(eq(trades.tradingSession, input.session));
    }
    if (input.dateFrom) {
      conditions.push(gte(trades.entryDatetime, new Date(input.dateFrom)));
    }
    if (input.dateTo) {
      conditions.push(lte(trades.entryDatetime, new Date(input.dateTo)));
    }
    if (input.tags && input.tags.length > 0) {
      conditions.push(
        sql`exists (
          select 1 from ${tradeTagPivot}
          where ${tradeTagPivot.tradeId} = ${trades.id}
            and ${inArray(tradeTagPivot.tagId, input.tags)}
        )`,
      );
    }
    if (input.demons && input.demons.length > 0) {
      conditions.push(
        sql`exists (
          select 1 from ${tradeDemonPivot}
          where ${tradeDemonPivot.tradeId} = ${trades.id}
            and ${inArray(tradeDemonPivot.demonId, input.demons)}
        )`,
      );
    }

    const where = and(...conditions);
    const [rows, totalRows] = await Promise.all([
      this.db
        .select()
        .from(trades)
        .where(where)
        .orderBy(desc(trades.entryDatetime))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(trades)
        .where(where),
    ]);

    return {
      rows,
      meta: {
        page: input.page,
        page_size: input.pageSize,
        total: Number(totalRows[0]?.count ?? 0),
      },
    };
  }

  async getById(id: string, userId: string): Promise<TradeDetailResponse> {
    const trade = await this.mustGetTrade(id, userId);
    const [attachments, tags, demons, checks] = await Promise.all([
      this.db
        .select()
        .from(tradeAttachments)
        .where(eq(tradeAttachments.tradeId, id)),
      this.db.select().from(tradeTagPivot).where(eq(tradeTagPivot.tradeId, id)),
      this.db
        .select()
        .from(tradeDemonPivot)
        .where(eq(tradeDemonPivot.tradeId, id)),
      this.db
        .select()
        .from(tradeConfluenceChecks)
        .where(eq(tradeConfluenceChecks.tradeId, id)),
    ]);
    return {
      ...trade,
      attachments,
      tagIds: tags.map((row) => row.tagId),
      demonIds: demons.map((row) => row.demonId),
      confluenceChecks: checks,
    };
  }

  async bulkUpdate(input: TradeBulkDto, userId: string) {
    const ownedTradeRows = await this.db
      .select({ id: trades.id })
      .from(trades)
      .where(
        and(inArray(trades.id, input.tradeIds), eq(trades.userId, userId)),
      );
    const ownedTradeIds = ownedTradeRows.map((row) => row.id);
    if (ownedTradeIds.length === 0) {
      return { success: true };
    }

    if (input.strategyId) {
      await this.strategiesService.getById(input.strategyId, userId);
      await this.db
        .update(trades)
        .set({ strategyId: input.strategyId, updatedAt: new Date() })
        .where(
          and(inArray(trades.id, ownedTradeIds), eq(trades.userId, userId)),
        );
    }

    if (input.tagIds) {
      await this.db
        .delete(tradeTagPivot)
        .where(inArray(tradeTagPivot.tradeId, ownedTradeIds));
      const values = ownedTradeIds.flatMap((tradeId) =>
        input.tagIds!.map((tagId) => ({ tradeId, tagId })),
      );
      if (values.length > 0) {
        await this.db.insert(tradeTagPivot).values(values);
      }
    }

    return { success: true };
  }

  async addAttachment(
    tradeId: string,
    file: { filename: string; mimetype: string; data: Buffer },
    userId: string,
    caption?: string,
  ) {
    await this.mustGetTrade(tradeId, userId);
    const safeName = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const path = await this.storage.save({
      folder: 'trade-attachments',
      filename: safeName,
      buffer: file.data,
    });

    const [attachment] = await this.db
      .insert(tradeAttachments)
      .values({
        tradeId,
        filePath: path,
        caption,
      })
      .returning();
    return attachment;
  }

  async deleteAttachment(id: string, userId: string) {
    const [attachment] = await this.db
      .select({
        id: tradeAttachments.id,
        filePath: tradeAttachments.filePath,
      })
      .from(tradeAttachments)
      .innerJoin(trades, eq(trades.id, tradeAttachments.tradeId))
      .where(and(eq(tradeAttachments.id, id), eq(trades.userId, userId)));
    if (!attachment) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Attachment not found',
      });
    }
    await this.storage.delete(attachment.filePath);
    await this.db.delete(tradeAttachments).where(eq(tradeAttachments.id, id));
    return { success: true };
  }

  private buildMetricInput(input: TradeInput) {
    return {
      direction: input.direction,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice,
      positionSize: input.positionSize,
      dollarRisk: input.dollarRisk,
      brokerCommission: input.brokerCommission,
      swap: input.swap,
      fundingFee: input.fundingFee,
      entryDatetime: new Date(input.entryDatetime),
      exitDatetime: input.exitDatetime
        ? new Date(input.exitDatetime)
        : undefined,
    };
  }

  private computeMetrics(
    metricInput: ReturnType<TradesService['buildMetricInput']>,
  ) {
    const holdingTimeSeconds = computeHoldingSeconds(
      metricInput.entryDatetime,
      metricInput.exitDatetime,
    );
    const holdingBucket = computeHoldingBucket(holdingTimeSeconds);
    const pnl = computePnl(metricInput);
    const rMultiple = computeRMultiple(pnl, metricInput.dollarRisk);
    const winLossFlag = computeWinLossFlag(pnl);
    return {
      holdingTimeSeconds,
      holdingBucket,
      pnl,
      rMultiple,
      winLossFlag,
    };
  }

  private async validateTradeInput(input: TradeInput, userId: string) {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)),
      );
    if (!account) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Account not found',
      });
    }

    const [instrument] = await this.db
      .select({ id: instruments.id })
      .from(instruments)
      .where(
        and(
          eq(instruments.id, input.instrumentId),
          eq(instruments.userId, userId),
        ),
      )
      .limit(1);
    if (!instrument) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Instrument not found',
      });
    }

    if (input.strategyId) {
      await this.strategiesService.getById(input.strategyId, userId);
    }

    if (account.accountType !== AccountTypeEnum.CRYPTO) {
      if (input.positionType || input.leverage || input.marginMode) {
        throw new BadRequestException({
          error: 'VALIDATION_ERROR',
          message: 'Crypto-only fields are only allowed for crypto accounts',
        });
      }
    }
    return account;
  }

  private buildWarnings(input: Partial<TradeInput>, accountTimezone?: string) {
    const warnings: string[] = [];
    if (!input.stopLoss) {
      warnings.push('stop_loss_missing');
    }
    if (!input.dollarRisk) {
      warnings.push('dollar_risk_missing');
    }
    if (
      input.timezone &&
      accountTimezone &&
      input.timezone !== accountTimezone
    ) {
      warnings.push('timezone_mismatch');
    }
    return warnings;
  }

  private async mustGetTrade(
    id: string,
    userId: string,
  ): Promise<TradeResponse> {
    const [trade] = await this.db
      .select()
      .from(trades)
      .where(
        and(
          eq(trades.id, id),
          eq(trades.userId, userId),
          isNull(trades.deletedAt),
        ),
      );
    if (!trade) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Trade not found',
      });
    }
    return trade;
  }

  private async syncTradeLinks(
    tradeId: string,
    input: {
      tagIds?: string[] | undefined;
      demonIds?: string[] | undefined;
      marketConditionTagIds?: string[] | undefined;
      marketConditionIds?: string[] | undefined;
    },
  ) {
    if (input.tagIds !== undefined) {
      await this.db
        .delete(tradeTagPivot)
        .where(eq(tradeTagPivot.tradeId, tradeId));
      if (input.tagIds.length > 0) {
        await this.db.insert(tradeTagPivot).values(
          input.tagIds.map((tagId) => ({
            tradeId,
            tagId,
          })),
        );
      }
    }

    if (input.demonIds !== undefined) {
      await this.db
        .delete(tradeDemonPivot)
        .where(eq(tradeDemonPivot.tradeId, tradeId));
      if (input.demonIds.length > 0) {
        await this.db.insert(tradeDemonPivot).values(
          input.demonIds.map((demonId) => ({
            tradeId,
            demonId,
          })),
        );
      }
    }

    if (input.marketConditionTagIds !== undefined) {
      await this.db
        .delete(tradeMarketConditionTagPivot)
        .where(eq(tradeMarketConditionTagPivot.tradeId, tradeId));
      if (input.marketConditionTagIds.length > 0) {
        await this.db.insert(tradeMarketConditionTagPivot).values(
          input.marketConditionTagIds.map((marketConditionTagId) => ({
            tradeId,
            marketConditionTagId,
          })),
        );
      }
    }

    if (input.marketConditionIds !== undefined) {
      await this.db
        .delete(tradeMarketConditionPivot)
        .where(eq(tradeMarketConditionPivot.tradeId, tradeId));
      if (input.marketConditionIds.length > 0) {
        await this.db.insert(tradeMarketConditionPivot).values(
          input.marketConditionIds.map((marketConditionId) => ({
            tradeId,
            marketConditionId,
          })),
        );
      }
    }
  }

  private async syncConfluenceChecks(
    tradeId: string,
    userId: string,
    strategyId?: string,
    manualChecks?: Array<{ confluenceId: string; checked: boolean }>,
  ) {
    await this.db
      .delete(tradeConfluenceChecks)
      .where(eq(tradeConfluenceChecks.tradeId, tradeId));
    if (!strategyId) {
      return [];
    }

    const confluences = await this.strategiesService.getConfluences(
      strategyId,
      userId,
    );
    if (confluences.length === 0) {
      return [];
    }

    const map = new Map(
      (manualChecks ?? []).map((check) => [check.confluenceId, check.checked]),
    );
    const values = confluences.map((conf) => ({
      tradeId,
      confluenceId: conf.id,
      checked: map.get(conf.id) ? 1 : 0,
      weightSnapshot: conf.impactWeight,
    }));
    await this.db.insert(tradeConfluenceChecks).values(values);
    return this.db
      .select()
      .from(tradeConfluenceChecks)
      .where(eq(tradeConfluenceChecks.tradeId, tradeId));
  }
}
