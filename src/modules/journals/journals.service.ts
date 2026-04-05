import { Transactional } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import { STORAGE_PROVIDER } from '../../common/storage/storage.provider';
import type { StorageProvider } from '../../common/storage/storage.provider';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import {
  accounts,
  dailyJournalAttachments,
  dailyJournalDemons,
  dailyJournalTrades,
  dailyJournals,
  demons,
  trades,
} from '../../db/schema';
import { JournalCreateDto, JournalUpdateDto } from './journals.schemas';
import type { JournalDetailResponse } from './interfaces/journal-detail.response';
import type { JournalsListResponse } from './interfaces/journals-list.response';

@Injectable()
export class JournalsService {
  constructor(
    @InjectDb() private readonly db: DB,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async list(input: {
    userId: string;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    accountId?: string | undefined;
    page: number;
    pageSize: number;
  }): Promise<JournalsListResponse> {
    const conditions = [
      eq(dailyJournals.userId, input.userId),
      isNull(dailyJournals.deletedAt),
    ];
    if (input.accountId) {
      conditions.push(eq(dailyJournals.accountId, input.accountId));
    }
    if (input.dateFrom) {
      conditions.push(gte(dailyJournals.date, input.dateFrom));
    }
    if (input.dateTo) {
      conditions.push(lte(dailyJournals.date, input.dateTo));
    }

    const where = and(...conditions);
    const [rows, totalRows] = await Promise.all([
      this.db
        .select()
        .from(dailyJournals)
        .where(where)
        .orderBy(desc(dailyJournals.date))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(dailyJournals)
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

  @Transactional()
  async create(input: JournalCreateDto, userId: string) {
    await this.validateJournalRefs({
      userId,
      accountId: input.accountId,
      tradeIds: input.tradeIds,
      demonIds: input.demonIds,
    });

    const [created] = await this.db
      .insert(dailyJournals)
      .values({
        userId,
        date: input.date,
        accountId: input.accountId,
        mood: input.mood,
        energy: input.energy,
        focus: input.focus,
        confidence: input.confidence,
        plan: input.plan,
        executionNotes: input.executionNotes,
        lessons: input.lessons,
        nextActions: input.nextActions,
      })
      .returning();

    await this.syncLinks(
      created.id,
      userId,
      input.tradeIds ?? [],
      input.demonIds ?? [],
    );

    return this.getById(created.id, userId);
  }

  async getById(id: string, userId: string): Promise<JournalDetailResponse> {
    const [journal] = await this.db
      .select()
      .from(dailyJournals)
      .where(
        and(
          eq(dailyJournals.id, id),
          eq(dailyJournals.userId, userId),
          isNull(dailyJournals.deletedAt),
        ),
      );
    if (!journal) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Journal not found',
      });
    }

    const [trades, demons, attachments] = await Promise.all([
      this.db
        .select()
        .from(dailyJournalTrades)
        .where(eq(dailyJournalTrades.dailyJournalId, id)),
      this.db
        .select()
        .from(dailyJournalDemons)
        .where(eq(dailyJournalDemons.dailyJournalId, id)),
      this.db
        .select()
        .from(dailyJournalAttachments)
        .where(eq(dailyJournalAttachments.dailyJournalId, id)),
    ]);

    return {
      ...journal,
      tradeIds: trades.map((row) => row.tradeId),
      demonIds: demons.map((row) => row.demonId),
      attachments,
    };
  }

  @Transactional()
  async update(id: string, input: JournalUpdateDto, userId: string) {
    await this.getById(id, userId);
    await this.validateJournalRefs({
      userId,
      accountId: input.accountId,
      tradeIds: input.tradeIds,
      demonIds: input.demonIds,
    });

    const [updated] = await this.db
      .update(dailyJournals)
      .set({
        date: input.date,
        accountId: input.accountId,
        mood: input.mood,
        energy: input.energy,
        focus: input.focus,
        confidence: input.confidence,
        plan: input.plan,
        executionNotes: input.executionNotes,
        lessons: input.lessons,
        nextActions: input.nextActions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dailyJournals.id, id),
          eq(dailyJournals.userId, userId),
          isNull(dailyJournals.deletedAt),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Journal not found',
      });
    }

    if (input.tradeIds !== undefined || input.demonIds !== undefined) {
      await this.syncLinks(id, userId, input.tradeIds, input.demonIds);
    }

    return this.getById(id, userId);
  }

  async addAttachment(
    journalId: string,
    file: { filename: string; mimetype: string; data: Buffer },
    userId: string,
    caption?: string,
  ) {
    await this.getById(journalId, userId);
    const safeName = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const path = await this.storage.save({
      folder: 'journal-attachments',
      filename: safeName,
      buffer: file.data,
    });

    const [attachment] = await this.db
      .insert(dailyJournalAttachments)
      .values({
        dailyJournalId: journalId,
        filePath: path,
        caption,
      })
      .returning();
    return attachment;
  }

  async deleteAttachment(id: string, userId: string) {
    const [attachment] = await this.db
      .select({
        id: dailyJournalAttachments.id,
        filePath: dailyJournalAttachments.filePath,
      })
      .from(dailyJournalAttachments)
      .innerJoin(
        dailyJournals,
        eq(dailyJournals.id, dailyJournalAttachments.dailyJournalId),
      )
      .where(
        and(
          eq(dailyJournalAttachments.id, id),
          eq(dailyJournals.userId, userId),
        ),
      );
    if (!attachment) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Attachment not found',
      });
    }
    await this.storage.delete(attachment.filePath);
    await this.db
      .delete(dailyJournalAttachments)
      .where(eq(dailyJournalAttachments.id, id));
    return { success: true };
  }

  private async syncLinks(
    journalId: string,
    userId: string,
    tradeIds?: string[],
    demonIds?: string[],
  ) {
    await this.validateJournalRefs({
      userId,
      tradeIds,
      demonIds,
    });

    if (tradeIds !== undefined) {
      await this.db
        .delete(dailyJournalTrades)
        .where(eq(dailyJournalTrades.dailyJournalId, journalId));
    }
    if (demonIds !== undefined) {
      await this.db
        .delete(dailyJournalDemons)
        .where(eq(dailyJournalDemons.dailyJournalId, journalId));
    }

    if (tradeIds && tradeIds.length > 0) {
      await this.db.insert(dailyJournalTrades).values(
        tradeIds.map((tradeId) => ({
          dailyJournalId: journalId,
          tradeId,
        })),
      );
    }
    if (demonIds && demonIds.length > 0) {
      await this.db.insert(dailyJournalDemons).values(
        demonIds.map((demonId) => ({
          dailyJournalId: journalId,
          demonId,
        })),
      );
    }
  }

  private async validateJournalRefs(input: {
    userId: string;
    accountId?: string | undefined;
    tradeIds?: string[] | undefined;
    demonIds?: string[] | undefined;
  }): Promise<void> {
    if (input.accountId) {
      const [account] = await this.db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.id, input.accountId),
            eq(accounts.userId, input.userId),
          ),
        )
        .limit(1);
      if (!account) {
        throw new BadRequestException({
          error: 'VALIDATION_ERROR',
          message: 'Account not found',
        });
      }
    }

    if (input.tradeIds && input.tradeIds.length > 0) {
      const rows = await this.db
        .select({ id: trades.id })
        .from(trades)
        .where(
          and(
            inArray(trades.id, input.tradeIds),
            eq(trades.userId, input.userId),
            isNull(trades.deletedAt),
          ),
        );
      if (rows.length !== input.tradeIds.length) {
        throw new BadRequestException({
          error: 'VALIDATION_ERROR',
          message: 'Some trades not found',
        });
      }
    }

    if (input.demonIds && input.demonIds.length > 0) {
      const rows = await this.db
        .select({ id: demons.id })
        .from(demons)
        .where(
          and(
            inArray(demons.id, input.demonIds),
            eq(demons.userId, input.userId),
          ),
        );
      if (rows.length !== input.demonIds.length) {
        throw new BadRequestException({
          error: 'VALIDATION_ERROR',
          message: 'Some demons not found',
        });
      }
    }
  }
}
