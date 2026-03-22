import type { InferSelectModel } from 'drizzle-orm';
import { instruments } from '@db/schema';

export interface InstrumentResponse extends InferSelectModel<
  typeof instruments
> {}
