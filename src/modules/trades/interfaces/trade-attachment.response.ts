import type { InferSelectModel } from 'drizzle-orm';
import { tradeAttachments } from '@db/schema';

export type TradeAttachmentResponse = InferSelectModel<typeof tradeAttachments>;
