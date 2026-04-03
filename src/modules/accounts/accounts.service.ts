import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import type {
  AccountCreateDto,
  AccountGroupCreateDto,
  AccountGroupUpdateDto,
  AccountUpdateDto,
} from './accounts.schemas';
import type { DB } from '@db/client';
import { InjectDb } from '@db/db.provider';
import { accountGroups, accounts } from '@db/schema';
import type { AccountGroupResponse } from './interfaces/account-group.response';
import type { AccountResponse } from './interfaces/account.response';

@Injectable()
export class AccountsService {
  constructor(@InjectDb() private readonly db: DB) {}

  private async ensureGroupBelongsToUser(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const [group] = await this.db
      .select({ id: accountGroups.id })
      .from(accountGroups)
      .where(
        and(eq(accountGroups.id, groupId), eq(accountGroups.userId, userId)),
      )
      .limit(1);

    if (!group) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account group not found',
      });
    }
  }

  async listGroups(userId: string): Promise<AccountGroupResponse[]> {
    return this.db
      .select()
      .from(accountGroups)
      .where(eq(accountGroups.userId, userId));
  }

  async createGroup(input: AccountGroupCreateDto, userId: string) {
    const [created] = await this.db
      .insert(accountGroups)
      .values({
        ...input,
        userId,
      })
      .returning();
    return created;
  }

  async updateGroup(id: string, input: AccountGroupUpdateDto, userId: string) {
    const [updated] = await this.db
      .update(accountGroups)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(accountGroups.id, id), eq(accountGroups.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account group not found',
      });
    }
    return updated;
  }

  async createAccount(input: AccountCreateDto, userId: string) {
    if (input.groupId) {
      await this.ensureGroupBelongsToUser(input.groupId, userId);
    }

    const [created] = await this.db
      .insert(accounts)
      .values({
        groupId: input.groupId ?? null,
        userId,
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

  async listAccounts(query: {
    userId: string;
    groupId?: string | undefined;
    archived?: boolean | undefined;
  }): Promise<AccountResponse[]> {
    if (query.groupId && query.archived === undefined) {
      return this.db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, query.userId),
            eq(accounts.groupId, query.groupId),
            isNull(accounts.deletedAt),
          ),
        );
    }

    if (query.groupId) {
      return this.db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, query.userId),
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
        .where(
          and(eq(accounts.userId, query.userId), isNotNull(accounts.deletedAt)),
        );
    }

    return this.db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.userId, query.userId), isNull(accounts.deletedAt)),
      );
  }

  async updateAccount(id: string, input: AccountUpdateDto, userId: string) {
    if (input.groupId !== undefined && input.groupId !== null) {
      await this.ensureGroupBelongsToUser(input.groupId, userId);
    }

    const [updated] = await this.db
      .update(accounts)
      .set({
        groupId: input.groupId === undefined ? undefined : input.groupId,
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
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }
    return updated;
  }

  async archiveAccount(id: string, userId: string) {
    const [updated] = await this.db
      .update(accounts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
    if (!updated) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }
    return updated;
  }

  async restoreAccount(id: string, userId: string) {
    const [updated] = await this.db
      .update(accounts)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
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
