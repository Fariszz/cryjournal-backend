import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import type { DB } from '@db/client';
import { InjectDb } from '@db/db.provider';
import { roles } from '@db/schema';
import type { AppRole } from './roles.constants';
import { APP_ROLES } from './roles.constants';

@Injectable()
export class RolesService {
  constructor(@InjectDb() private readonly db: DB) {}

  async getRoleIdByName(roleName: AppRole): Promise<string> {
    await this.seedDefaultRoles();

    const [role] = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);

    if (!role) {
      throw new Error(`Role ${roleName} is not available`);
    }

    return role.id;
  }

  async getRoleIdsByNames(roleNames: readonly AppRole[]): Promise<string[]> {
    if (roleNames.length === 0) {
      return [];
    }

    await this.seedDefaultRoles();
    const uniqueRoleNames = Array.from(new Set(roleNames));

    const roleRows = await this.db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(inArray(roles.name, uniqueRoleNames));

    return roleRows.map((row) => row.id);
  }

  private async seedDefaultRoles(): Promise<void> {
    await this.db
      .insert(roles)
      .values(APP_ROLES.map((roleName) => ({ name: roleName })))
      .onConflictDoNothing();
  }
}
