import type { InferSelectModel } from 'drizzle-orm';
import { dailyJournals } from '@db/schema';

export interface JournalResponse extends InferSelectModel<
  typeof dailyJournals
> {}
