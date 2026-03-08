import type { InferSelectModel } from 'drizzle-orm';
import { demonEvidenceLogs } from '@db/schema';

export type DemonEvidenceLogResponse = InferSelectModel<
  typeof demonEvidenceLogs
>;
