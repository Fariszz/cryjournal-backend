import type { InferSelectModel } from 'drizzle-orm';
import { strategies } from '@db/schema';

export type StrategyResponse = InferSelectModel<typeof strategies>;
