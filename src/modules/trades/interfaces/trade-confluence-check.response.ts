import type { InferSelectModel } from 'drizzle-orm';
import { tradeConfluenceChecks } from '@db/schema';

export interface TradeConfluenceCheckResponse
  extends InferSelectModel<typeof tradeConfluenceChecks> {}
