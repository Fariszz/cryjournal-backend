import type { InferSelectModel } from 'drizzle-orm';
import { accountGroups } from '@db/schema';

export type AccountGroupResponse = InferSelectModel<typeof accountGroups>;
