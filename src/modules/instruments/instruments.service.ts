import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { instruments } from '../../db/schema';

@Injectable()
export class InstrumentsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async list() {
    return this.db.select().from(instruments);
  }

  async create(input: { symbol: string; category: string }) {
    const [existing] = await this.db
      .select()
      .from(instruments)
      .where(eq(instruments.symbol, input.symbol.toUpperCase()));

    if (existing) {
      return existing;
    }

    const [created] = await this.db
      .insert(instruments)
      .values({
        symbol: input.symbol.toUpperCase(),
        category: input.category.toLowerCase(),
      })
      .returning();

    return created;
  }

  async ensureBySymbol(symbol: string, category = 'unknown') {
    const normalized = symbol.toUpperCase();
    const [existing] = await this.db
      .select()
      .from(instruments)
      .where(eq(instruments.symbol, normalized));

    if (existing) {
      return existing;
    }
    const [created] = await this.db
      .insert(instruments)
      .values({ symbol: normalized, category })
      .returning();
    return created;
  }
}
