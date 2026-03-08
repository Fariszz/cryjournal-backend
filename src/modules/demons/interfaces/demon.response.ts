import type { InferSelectModel } from 'drizzle-orm';
import { demons } from '@db/schema';

export type DemonResponse = InferSelectModel<typeof demons>;
