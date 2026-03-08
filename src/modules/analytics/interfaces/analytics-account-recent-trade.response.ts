import type { InferSelectModel } from 'drizzle-orm';
import { trades } from '@db/schema';

export type AnalyticsAccountRecentTradeResponse = InferSelectModel<
  typeof trades
>;
