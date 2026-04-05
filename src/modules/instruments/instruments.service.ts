import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { instruments } from '../../db/schema';
import { InstrumentCreateDto } from './instruments.schemas';
import type { InstrumentResponse } from './interfaces/instrument.response';

@Injectable()
export class InstrumentsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async list(userId: string): Promise<InstrumentResponse[]> {
    return this.db
      .select()
      .from(instruments)
      .where(eq(instruments.userId, userId));
  }

  async create(input: InstrumentCreateDto, userId: string) {
    const normalizedSymbol = input.symbol.toUpperCase();
    const [existing] = await this.db
      .select()
      .from(instruments)
      .where(
        and(
          eq(instruments.userId, userId),
          eq(instruments.symbol, normalizedSymbol),
        ),
      );

    if (existing) {
      return existing;
    }

    const [created] = await this.db
      .insert(instruments)
      .values({
        userId,
        symbol: normalizedSymbol,
        category: input.category.toLowerCase(),
      })
      .returning();

    return created;
  }

  async ensureBySymbol(symbol: string, userId: string, category = 'unknown') {
    const normalized = symbol.toUpperCase();
    const [existing] = await this.db
      .select()
      .from(instruments)
      .where(
        and(eq(instruments.userId, userId), eq(instruments.symbol, normalized)),
      );

    if (existing) {
      return existing;
    }
    const [created] = await this.db
      .insert(instruments)
      .values({ userId, symbol: normalized, category })
      .returning();
    return created;
  }
}
