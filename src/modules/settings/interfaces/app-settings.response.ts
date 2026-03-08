import type { InferSelectModel } from 'drizzle-orm';
import { appSettings } from '@db/schema';

export interface AppSettingsResponse
  extends InferSelectModel<typeof appSettings> {}
