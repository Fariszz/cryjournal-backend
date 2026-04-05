import { z } from 'zod';
import { UserRoleEnum } from '@common/enums/user-role.enum';

export const updateUserRolesSchema = z.object({
  roles: z
    .array(
      z.nativeEnum(UserRoleEnum).describe('Assigned user role enum value.'),
    )
    .nonempty()
    .describe('List of user roles to assign (minimum 1 role).'),
});

export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;
