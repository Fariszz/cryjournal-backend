import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { tradeContextEvents } from '../../db/schema';
import {
  ECONOMIC_CALENDAR_PROVIDER,
} from './economic-calendar.provider';
import type { EconomicCalendarProvider } from './economic-calendar.provider';
import type {
  AttachContextEventDto,
  EconomicCalendarQueryDto,
} from './economic-calendar.schemas';

@Injectable()
export class EconomicCalendarService {
  private readonly cache = new Map<
    string,
    { expiresAt: number; data: unknown }
  >();

  constructor(
    @InjectDb() private readonly db: DB,
    @Inject(ECONOMIC_CALENDAR_PROVIDER)
    private readonly provider: EconomicCalendarProvider,
  ) {}

  async getEvents(input: EconomicCalendarQueryDto) {
    const key = JSON.stringify(input);
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }
    const data = await this.provider.getEvents(input);
    this.cache.set(key, {
      data,
      expiresAt: now + 60 * 60 * 1000,
    });
    return data;
  }

  async attachEventToTrade(
    tradeId: string,
    input: AttachContextEventDto,
  ) {
    const [created] = await this.db
      .insert(tradeContextEvents)
      .values({
        tradeId,
        providerEventId: input.providerEventId,
        title: input.title,
        impact: input.impact,
        currency: input.currency,
        eventTime: new Date(input.eventTime),
        raw: JSON.stringify(input.raw ?? {}),
      })
      .returning();
    return created;
  }
}
