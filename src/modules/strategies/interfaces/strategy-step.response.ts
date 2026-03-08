import type { InferSelectModel } from 'drizzle-orm';
import { strategySteps } from '@db/schema';

export type StrategyStepResponse = InferSelectModel<typeof strategySteps>;
