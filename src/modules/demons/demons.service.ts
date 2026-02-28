import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import {
  demonEvidenceLogs,
  demonPerformanceLogs,
  demons,
} from '@db/schema';

@Injectable()
export class DemonsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async list() {
    return this.db.select().from(demons);
  }

  async create(input: {
    name: string;
    trigger?: string;
    pattern?: string;
    consequence?: string;
    counterPlan?: string;
    preventionChecklist: string[];
  }) {
    const [created] = await this.db
      .insert(demons)
      .values({
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

  async getById(id: string) {
    const [demon] = await this.db
      .select()
      .from(demons)
      .where(eq(demons.id, id));
    if (!demon) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Demon not found',
      });
    }
    return demon;
  }

  async update(
    id: string,
    input: Partial<{
      name: string;
      trigger?: string;
      pattern?: string;
      consequence?: string;
      counterPlan?: string;
      preventionChecklist: string[];
    }>,
  ) {
    const [updated] = await this.db
      .update(demons)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(demons.id, id))
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
    input: {
      tradeId?: string;
      dailyJournalId?: string;
      note?: string;
      screenshotPath?: string;
    },
  ) {
    await this.getById(demonId);
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

  async listEvidence(demonId: string) {
    await this.getById(demonId);
    return this.db
      .select()
      .from(demonEvidenceLogs)
      .where(eq(demonEvidenceLogs.demonId, demonId))
      .orderBy(desc(demonEvidenceLogs.createdAt));
  }

  async performance(demonId: string) {
    await this.getById(demonId);
    return this.db
      .select()
      .from(demonPerformanceLogs)
      .where(eq(demonPerformanceLogs.demonId, demonId))
      .orderBy(desc(demonPerformanceLogs.date));
  }
}
