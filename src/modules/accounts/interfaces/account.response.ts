import type { InferSelectModel } from 'drizzle-orm';
import { accounts } from '@db/schema';

export interface AccountResponse extends InferSelectModel<typeof accounts> {}
