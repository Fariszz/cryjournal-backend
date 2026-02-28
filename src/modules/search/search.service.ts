import { Injectable } from '@nestjs/common';
import { and, ilike, isNull, or } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import {
  demons,
  instruments,
  strategies,
  tradeTags,
  trades,
} from '../../db/schema';

@Injectable()
export class SearchService {
  constructor(@InjectDb() private readonly db: DB) {}

  async search(query: string) {
    const pattern = `%${query}%`;

    const [instrumentRows, tagRows, strategyRows, demonRows, tradeRows] =
      await Promise.all([
        this.db
          .select({
            id: instruments.id,
            symbol: instruments.symbol,
            category: instruments.category,
          })
          .from(instruments)
          .where(
            or(
              ilike(instruments.symbol, pattern),
              ilike(instruments.category, pattern),
            ),
          )
          .limit(10),
        this.db
          .select()
          .from(tradeTags)
          .where(ilike(tradeTags.name, pattern))
          .limit(10),
        this.db
          .select()
          .from(strategies)
          .where(
            or(
              ilike(strategies.name, pattern),
              ilike(strategies.description, pattern),
            ),
          )
          .limit(10),
        this.db
          .select()
          .from(demons)
          .where(
            or(ilike(demons.name, pattern), ilike(demons.pattern, pattern)),
          )
          .limit(10),
        this.db
          .select({
            id: trades.id,
            thesis: trades.thesis,
            postAnalysis: trades.postAnalysis,
            notes: trades.notes,
          })
          .from(trades)
          .where(
            and(
              isNull(trades.deletedAt),
              or(
                ilike(trades.thesis, pattern),
                ilike(trades.postAnalysis, pattern),
                ilike(trades.notes, pattern),
              ),
            ),
          )
          .limit(10),
      ]);

    return {
      instruments: instrumentRows,
      tags: tagRows,
      strategies: strategyRows,
      demons: demonRows,
      notes: tradeRows,
    };
  }
}
