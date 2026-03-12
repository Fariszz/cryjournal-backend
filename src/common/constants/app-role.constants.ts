import { UserRoleEnum } from '@common/enums/user-role.enum';

export type AppRole = `${UserRoleEnum}`;

export const APP_ROLES = Object.values(UserRoleEnum) as [AppRole, ...AppRole[]];

export const DEFAULT_USER_ROLE: AppRole = UserRoleEnum.USER;

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
