import type { InferSelectModel } from 'drizzle-orm';
import { demonPerformanceLogs } from '@db/schema';

export type DemonPerformanceLogResponse = InferSelectModel<
  typeof demonPerformanceLogs
>;
