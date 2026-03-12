import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import type { AppRole } from '@common/constants/app-role.constants';
import { APP_ROLES } from '@common/constants/app-role.constants';
import type { DB } from '@db/client';
import { InjectDb } from '@db/db.provider';
import { roles } from '@db/schema';

@Injectable()
export class AppRolesService {
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
      .select({ id: roles.id })
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
