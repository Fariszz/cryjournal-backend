import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AppRole } from '@modules/roles/roles.constants';

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  roles: AppRole[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    return req.user;
  },
);
