import { z } from 'zod';
import { APP_ROLES } from '@modules/roles/roles.constants';

export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(APP_ROLES)).nonempty(),
});

export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;
