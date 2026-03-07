import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { count, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { hashPassword } from '@common/auth/password.util';
import type { DB } from '@db/client';
import { InjectDb } from '@db/db.provider';
import { roles, userRoles, users } from '@db/schema';
import type { AppRole } from '@modules/roles/roles.constants';
import { DEFAULT_USER_ROLE, isAppRole } from '@modules/roles/roles.constants';
import { RolesService } from '@modules/roles/roles.service';

interface UserJoinedRow {
  id: string;
  email: string;
  name: string;
  googleId: string | null;
  isActive: boolean;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  roleName: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  googleId: string | null;
  isActive: boolean;
  roles: AppRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends UserProfile {
  passwordHash: string | null;
}

export interface UsersPaginationResult {
  items: UserProfile[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectDb() private readonly db: DB,
    private readonly rolesService: RolesService,
  ) {}

  async findProfileById(id: string): Promise<UserProfile | null> {
    const rows = await this.findJoinedRowsByFilter(eq(users.id, id));
    const user = this.mapJoinedRows(rows);
    if (!user) {
      return null;
    }
    return this.toUserProfile(user);
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const normalizedEmail = this.normalizeEmail(email);
    const rows = await this.findJoinedRowsByFilter(
      eq(users.email, normalizedEmail),
    );
    const user = this.mapJoinedRows(rows);
    if (!user) {
      return null;
    }
    return this.toUserProfile(user);
  }

  async findAuthUserByEmail(email: string): Promise<UserWithPassword | null> {
    const normalizedEmail = this.normalizeEmail(email);
    const rows = await this.findJoinedRowsByFilter(
      eq(users.email, normalizedEmail),
    );
    return this.mapJoinedRows(rows);
  }

  async findAuthUserByGoogleId(
    googleId: string,
  ): Promise<UserWithPassword | null> {
    const rows = await this.findJoinedRowsByFilter(
      eq(users.googleId, googleId),
    );
    return this.mapJoinedRows(rows);
  }

  async createLocalUser(input: {
    email: string;
    name: string;
    password: string;
  }): Promise<UserProfile> {
    const normalizedEmail = this.normalizeEmail(input.email);
    const passwordHash = await hashPassword(input.password);

    const [insertedUser] = await this.db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: input.name.trim(),
        passwordHash,
        isActive: true,
      })
      .returning({ id: users.id });

    if (!insertedUser) {
      throw new Error('Failed to create user');
    }

    await this.ensureUserHasRole(insertedUser.id, DEFAULT_USER_ROLE);
    const createdUser = await this.findProfileById(insertedUser.id);

    if (!createdUser) {
      throw new Error('Created user could not be loaded');
    }

    return createdUser;
  }

  async upsertGoogleUser(input: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<UserProfile> {
    const normalizedEmail = this.normalizeEmail(input.email);
    const normalizedName = input.name.trim();

    const existingGoogleUser = await this.findAuthUserByGoogleId(
      input.googleId,
    );
    if (existingGoogleUser) {
      await this.ensureUserHasRole(existingGoogleUser.id, DEFAULT_USER_ROLE);
      return this.toUserProfile(existingGoogleUser);
    }

    const existingEmailUser = await this.findAuthUserByEmail(normalizedEmail);
    if (existingEmailUser) {
      await this.db
        .update(users)
        .set({
          googleId: input.googleId,
          name: normalizedName || existingEmailUser.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingEmailUser.id));

      await this.ensureUserHasRole(existingEmailUser.id, DEFAULT_USER_ROLE);

      const updatedUser = await this.findProfileById(existingEmailUser.id);
      if (!updatedUser) {
        throw new Error('Updated user could not be loaded');
      }

      return updatedUser;
    }

    const [insertedGoogleUser] = await this.db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: normalizedName,
        googleId: input.googleId,
        passwordHash: null,
        isActive: true,
      })
      .returning({ id: users.id });

    if (!insertedGoogleUser) {
      throw new Error('Failed to create Google user');
    }

    await this.ensureUserHasRole(insertedGoogleUser.id, DEFAULT_USER_ROLE);
    const createdGoogleUser = await this.findProfileById(insertedGoogleUser.id);

    if (!createdGoogleUser) {
      throw new Error('Created Google user could not be loaded');
    }

    return createdGoogleUser;
  }

  async listUsers(page: number, limit: number): Promise<UsersPaginationResult> {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (normalizedPage - 1) * normalizedLimit;

    const [countResult] = await this.db.select({ total: count() }).from(users);
    const total = Number(countResult?.total ?? 0);

    const userRows = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        googleId: users.googleId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(normalizedLimit)
      .offset(offset);

    const userIds = userRows.map((userRow) => userRow.id);
    const rolesByUserId = new Map<string, AppRole[]>();

    if (userIds.length > 0) {
      const roleRows = await this.db
        .select({
          userId: userRoles.userId,
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(inArray(userRoles.userId, userIds));

      for (const roleRow of roleRows) {
        if (!isAppRole(roleRow.roleName)) {
          continue;
        }
        const currentRoles = rolesByUserId.get(roleRow.userId) ?? [];
        currentRoles.push(roleRow.roleName);
        rolesByUserId.set(roleRow.userId, currentRoles);
      }
    }

    const items: UserProfile[] = userRows.map((userRow) => ({
      ...userRow,
      roles: rolesByUserId.get(userRow.id) ?? [],
    }));

    const totalPages = total === 0 ? 0 : Math.ceil(total / normalizedLimit);

    return {
      items,
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages,
    };
  }

  async assignRoles(
    userId: string,
    requestedRoles: AppRole[],
  ): Promise<UserProfile> {
    if (requestedRoles.length === 0) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'At least one role must be provided',
      });
    }

    const user = await this.findProfileById(userId);
    if (!user) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const uniqueRoles = Array.from(new Set(requestedRoles));
    const roleIds = await this.rolesService.getRoleIdsByNames(uniqueRoles);

    if (roleIds.length !== uniqueRoles.length) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'One or more requested roles do not exist',
      });
    }

    await this.db.delete(userRoles).where(eq(userRoles.userId, user.id));
    await this.db
      .insert(userRoles)
      .values(roleIds.map((roleId) => ({ userId: user.id, roleId })))
      .onConflictDoNothing();

    const updatedUser = await this.findProfileById(user.id);
    if (!updatedUser) {
      throw new Error('Updated user could not be loaded');
    }

    return updatedUser;
  }

  async setActive(userId: string, isActive: boolean): Promise<UserProfile> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const user = await this.findProfileById(updatedUser.id);
    if (!user) {
      throw new Error('Updated user could not be loaded');
    }

    return user;
  }

  private async ensureUserHasRole(
    userId: string,
    roleName: AppRole,
  ): Promise<void> {
    const roleId = await this.rolesService.getRoleIdByName(roleName);
    await this.db
      .insert(userRoles)
      .values({
        userId,
        roleId,
      })
      .onConflictDoNothing();
  }

  private async findJoinedRowsByFilter(
    filter: SQL<unknown>,
  ): Promise<UserJoinedRow[]> {
    return this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        googleId: users.googleId,
        isActive: users.isActive,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(filter);
  }

  private mapJoinedRows(rows: UserJoinedRow[]): UserWithPassword | null {
    if (rows.length === 0) {
      return null;
    }

    const [firstRow] = rows;
    if (!firstRow) {
      return null;
    }

    const uniqueRoles = new Set<AppRole>();
    for (const row of rows) {
      if (row.roleName && isAppRole(row.roleName)) {
        uniqueRoles.add(row.roleName);
      }
    }

    return {
      id: firstRow.id,
      email: firstRow.email,
      name: firstRow.name,
      googleId: firstRow.googleId,
      isActive: firstRow.isActive,
      passwordHash: firstRow.passwordHash,
      roles: Array.from(uniqueRoles),
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUserProfile(user: UserWithPassword): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      isActive: user.isActive,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
