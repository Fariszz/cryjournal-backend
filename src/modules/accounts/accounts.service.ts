import { Transactional } from '@nestjs-cls/transactional';
import { Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import type {
  AccountBulkCreateDto,
  AccountBulkUpdateDto,
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
import type { SelectOptionResponse } from './interfaces/select-option.response';
import {
  ACCOUNT_TYPE_OPTIONS,
  BROKER_OPTIONS,
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from './seeds/account-select-options.seed';

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

  listAccountTypeOptions(): SelectOptionResponse[] {
    return ACCOUNT_TYPE_OPTIONS;
  }

  listCurrencyOptions(): SelectOptionResponse[] {
    return CURRENCY_OPTIONS;
  }

  listBrokerOptions(): SelectOptionResponse[] {
    return BROKER_OPTIONS;
  }

  listTimezoneOptions(): SelectOptionResponse[] {
    return TIMEZONE_OPTIONS;
  }

  async listGroups(userId: string): Promise<AccountGroupResponse[]> {
    return this.db
      .select({
        id: accountGroups.id,
        name: accountGroups.name,
        description: accountGroups.description,
        userId: accountGroups.userId,
        createdAt: accountGroups.createdAt,
        updatedAt: accountGroups.updatedAt,
        accountCount: count(accounts.id),
      })
      .from(accountGroups)
      .leftJoin(
        accounts,
        and(
          eq(accounts.groupId, accountGroups.id),
          eq(accounts.userId, userId),
          isNull(accounts.deletedAt),
        ),
      )
      .where(eq(accountGroups.userId, userId))
      .groupBy(
        accountGroups.id,
        accountGroups.name,
        accountGroups.description,
        accountGroups.userId,
        accountGroups.createdAt,
        accountGroups.updatedAt,
      );
  }

  async getGroup(id: string, userId: string): Promise<AccountGroupResponse> {
    const [group] = await this.db
      .select({
        id: accountGroups.id,
        name: accountGroups.name,
        description: accountGroups.description,
        userId: accountGroups.userId,
        createdAt: accountGroups.createdAt,
        updatedAt: accountGroups.updatedAt,
        accountCount: count(accounts.id),
      })
      .from(accountGroups)
      .leftJoin(
        accounts,
        and(
          eq(accounts.groupId, accountGroups.id),
          eq(accounts.userId, userId),
          isNull(accounts.deletedAt),
        ),
      )
      .where(and(eq(accountGroups.id, id), eq(accountGroups.userId, userId)))
      .groupBy(
        accountGroups.id,
        accountGroups.name,
        accountGroups.description,
        accountGroups.userId,
        accountGroups.createdAt,
        accountGroups.updatedAt,
      )
      .limit(1);
    if (!group) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account group not found',
      });
    }
    return group;
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

  @Transactional()
  async createAccounts(
    input: AccountBulkCreateDto,
    userId: string,
  ): Promise<AccountResponse[]> {
    const groupIds = [
      ...new Set(
        input
          .map((account) => account.groupId)
          .filter((groupId): groupId is string => groupId != null),
      ),
    ];
    for (const groupId of groupIds) {
      await this.ensureGroupBelongsToUser(groupId, userId);
    }
    const values = input.map((account) => ({
      groupId: account.groupId ?? null,
      userId,
      name: account.name,
      broker: account.broker,
      accountType: account.accountType,
      baseCurrency: account.baseCurrency,
      timezone: account.timezone,
      startingBalance: account.startingBalance?.toString(),
    }));
    return this.db.insert(accounts).values(values).returning();
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

  async getAccount(id: string, userId: string): Promise<AccountResponse> {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .limit(1);
    if (!account) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Account not found',
      });
    }
    return account;
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

  @Transactional()
  async updateAccounts(
    input: AccountBulkUpdateDto,
    userId: string,
  ): Promise<AccountResponse[]> {
    const accountIds = input.map((account) => account.id);
    const uniqueAccountIds = [...new Set(accountIds)];
    const ownedRows = await this.db
      .select({ id: accounts.id })
      .from(accounts)
      .where(
        and(
          inArray(accounts.id, uniqueAccountIds),
          eq(accounts.userId, userId),
        ),
      );
    if (ownedRows.length !== uniqueAccountIds.length) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'One or more accounts not found',
      });
    }
    const groupIds = [
      ...new Set(
        input
          .map((account) => account.groupId)
          .filter(
            (groupId): groupId is string =>
              groupId !== undefined && groupId !== null,
          ),
      ),
    ];
    for (const groupId of groupIds) {
      await this.ensureGroupBelongsToUser(groupId, userId);
    }
    const updatedAccounts: AccountResponse[] = [];
    for (const account of input) {
      const [updated] = await this.db
        .update(accounts)
        .set({
          groupId: account.groupId === undefined ? undefined : account.groupId,
          name: account.name,
          broker: account.broker,
          accountType: account.accountType,
          baseCurrency: account.baseCurrency,
          timezone: account.timezone,
          startingBalance:
            account.startingBalance === undefined
              ? undefined
              : account.startingBalance.toString(),
          updatedAt: new Date(),
        })
        .where(and(eq(accounts.id, account.id), eq(accounts.userId, userId)))
        .returning();
      if (updated) {
        updatedAccounts.push(updated);
      }
    }
    return updatedAccounts;
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
