import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import {
  dailyJournals,
  demonEvidenceLogs,
  demonPerformanceLogs,
  demons,
  trades,
} from '@db/schema';
import {
  DemonCreateDto,
  DemonUpdateDto,
  EvidenceCreateDto,
} from './demons.schemas';
import type { DemonEvidenceLogResponse } from './interfaces/demon-evidence-log.response';
import type { DemonPerformanceLogResponse } from './interfaces/demon-performance-log.response';
import type { DemonResponse } from './interfaces/demon.response';

@Injectable()
export class DemonsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async list(userId: string): Promise<DemonResponse[]> {
    return this.db.select().from(demons).where(eq(demons.userId, userId));
  }

  async create(input: DemonCreateDto, userId: string) {
    const [created] = await this.db
      .insert(demons)
      .values({
        userId,
        name: input.name,
        trigger: input.trigger,
        pattern: input.pattern,
        consequence: input.consequence,
        counterPlan: input.counterPlan,
        preventionChecklist: input.preventionChecklist,
      })
      .returning();
    return created;
  }

  async getById(id: string, userId: string): Promise<DemonResponse> {
    const [demon] = await this.db
      .select()
      .from(demons)
      .where(and(eq(demons.id, id), eq(demons.userId, userId)));
    if (!demon) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Demon not found',
      });
    }
    return demon;
  }

  async update(id: string, input: DemonUpdateDto, userId: string) {
    const [updated] = await this.db
      .update(demons)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(demons.id, id), eq(demons.userId, userId)))
      .returning();
    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Demon not found',
      });
    }
    return updated;
  }

  async createEvidence(
    demonId: string,
    input: EvidenceCreateDto,
    userId: string,
  ) {
    await this.getById(demonId, userId);
    if (input.tradeId) {
      await this.ensureTradeBelongsToUser(input.tradeId, userId);
    }
    if (input.dailyJournalId) {
      await this.ensureJournalBelongsToUser(input.dailyJournalId, userId);
    }
    const [created] = await this.db
      .insert(demonEvidenceLogs)
      .values({
        demonId,
        tradeId: input.tradeId,
        dailyJournalId: input.dailyJournalId,
        note: input.note,
        screenshotPath: input.screenshotPath,
      })
      .returning();
    return created;
  }

  async listEvidence(
    demonId: string,
    userId: string,
  ): Promise<DemonEvidenceLogResponse[]> {
    await this.getById(demonId, userId);
    return this.db
      .select()
      .from(demonEvidenceLogs)
      .where(eq(demonEvidenceLogs.demonId, demonId))
      .orderBy(desc(demonEvidenceLogs.createdAt));
  }

  async performance(
    demonId: string,
    userId: string,
  ): Promise<DemonPerformanceLogResponse[]> {
    await this.getById(demonId, userId);
    return this.db
      .select()
      .from(demonPerformanceLogs)
      .where(eq(demonPerformanceLogs.demonId, demonId))
      .orderBy(desc(demonPerformanceLogs.date));
  }

  private async ensureTradeBelongsToUser(
    tradeId: string,
    userId: string,
  ): Promise<void> {
    const [trade] = await this.db
      .select({ id: trades.id })
      .from(trades)
      .where(and(eq(trades.id, tradeId), eq(trades.userId, userId)))
      .limit(1);

    if (!trade) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Trade not found',
      });
    }
  }

  private async ensureJournalBelongsToUser(
    journalId: string,
    userId: string,
  ): Promise<void> {
    const [journal] = await this.db
      .select({ id: dailyJournals.id })
      .from(dailyJournals)
      .where(
        and(eq(dailyJournals.id, journalId), eq(dailyJournals.userId, userId)),
      )
      .limit(1);

    if (!journal) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Journal not found',
      });
    }
  }
}
