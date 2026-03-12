import { z } from 'zod';
import { UserRoleEnum } from '@common/enums/user-role.enum';

export const updateUserRolesSchema = z.object({
  roles: z.array(z.nativeEnum(UserRoleEnum)).nonempty(),
});

export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;
