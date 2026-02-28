import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { AccountCreateInput, AccountUpdateInput } from './accounts.schemas';
import type { DB } from '@db/client';
import { InjectDb } from '@db/db.provider';
import { accountGroups } from '@db/schema';

@Injectable()
export class AccountsService {
  constructor(@InjectDb() private readonly db: DB) {}

  async listGroups() {
    return await this.db.select().from(accountGroups);
  }

  async createGroup(input: { name: string; description?: string }) {
    const [created] = await this.db
      .insert(accountGroups)
      .values(input)
      .returning();
    return created;
  }

  async updateGroup(
    id: string,
    input: { name?: string; description?: string },
  ) {
    const [updated] = await this.db
      .update(accountGroups)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(accountGroups.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account group not found',
      });
    }
    return updated;
  }

  async createAccount(input: AccountCreateInput) {
    const [created] = await this.db
      .insert(accounts)
      .values({
        groupId: input.groupId ?? null,
        name: input.name,
        broker: input.broker,
        accountType: input.accountType,
        baseCurrency: input.baseCurrency,
        timezone: input.timezone,
        startingBalance: input.startingBalance?.toString(),
      })
      .returning();
    return created;
  }

  async listAccounts(query: { groupId?: string; archived?: boolean }) {
    if (query.groupId && query.archived === undefined) {
      return this.db
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.groupId, query.groupId), isNull(accounts.deletedAt)),
        );
    }

    if (query.groupId) {
      return this.db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.groupId, query.groupId),
            query.archived
              ? isNotNull(accounts.deletedAt)
              : isNull(accounts.deletedAt),
          ),
        );
    }

    if (query.archived) {
      return this.db
        .select()
        .from(accounts)
        .where(isNotNull(accounts.deletedAt));
    }

    return this.db.select().from(accounts).where(isNull(accounts.deletedAt));
  }

  async updateAccount(id: string, input: AccountUpdateInput) {
    const [updated] = await this.db
      .update(accounts)
      .set({
        groupId: input.groupId ?? undefined,
        name: input.name,
        broker: input.broker,
        accountType: input.accountType,
        baseCurrency: input.baseCurrency,
        timezone: input.timezone,
        startingBalance:
          input.startingBalance === undefined
            ? undefined
            : input.startingBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }
    return updated;
  }

  async archiveAccount(id: string) {
    const [updated] = await this.db
      .update(accounts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }
    return updated;
  }

  async restoreAccount(id: string) {
    const [updated] = await this.db
      .update(accounts)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }
    return updated;
  }
}
