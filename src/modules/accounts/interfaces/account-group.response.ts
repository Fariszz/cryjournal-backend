import type { InferSelectModel } from 'drizzle-orm';
import { accountGroups } from '@db/schema';

export interface AccountGroupResponse extends InferSelectModel<
  typeof accountGroups
> {
  readonly accountCount: number;
}
