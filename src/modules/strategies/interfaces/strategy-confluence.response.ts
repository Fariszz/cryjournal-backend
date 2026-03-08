import type { InferSelectModel } from 'drizzle-orm';
import { strategyConfluences } from '@db/schema';

export type StrategyConfluenceResponse = InferSelectModel<
  typeof strategyConfluences
>;
