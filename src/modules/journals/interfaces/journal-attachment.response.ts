import type { InferSelectModel } from 'drizzle-orm';
import { dailyJournalAttachments } from '@db/schema';

export interface JournalAttachmentResponse extends InferSelectModel<
  typeof dailyJournalAttachments
> {}
