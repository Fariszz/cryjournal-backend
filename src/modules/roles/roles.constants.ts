export const APP_ROLES = ['ADMIN', 'USER'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const DEFAULT_USER_ROLE: AppRole = 'USER';

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
