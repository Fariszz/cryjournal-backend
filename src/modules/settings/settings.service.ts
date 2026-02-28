import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import { DB } from '../../db/client';
import { appSettings } from '../../db/schema';
import { UpdateSettingsInput } from './settings.schemas';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class SettingsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async getSettings() {
    const [settings] = await this.db
      .select()
      .from(appSettings)
      .where(eq(appSettings.id, SETTINGS_ID));
    return settings ?? null;
  }

  async updateSettings(input: UpdateSettingsInput) {
    const existing = await this.getSettings();
    if (!existing) {
      const [created] = await this.db
        .insert(appSettings)
        .values({
          id: SETTINGS_ID,
          ...input,
          sessionDefinitions: input.sessionDefinitions ?? [],
          riskParameters: input.riskParameters ?? {},
        })
        .returning();
      return created;
    }

    const [updated] = await this.db
      .update(appSettings)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, SETTINGS_ID))
      .returning();

    return updated;
  }
}
