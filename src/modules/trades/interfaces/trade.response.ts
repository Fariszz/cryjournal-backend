import type { InferSelectModel } from 'drizzle-orm';
import { trades } from '@db/schema';

export interface TradeResponse extends InferSelectModel<typeof trades> {}
