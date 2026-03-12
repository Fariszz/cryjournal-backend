import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
import type { AppRole } from '@common/constants/app-role.constants';

export function Auth(...roles: AppRole[]): ClassDecorator & MethodDecorator {
  if (roles.length === 0) {
    return applyDecorators(ApiBearerAuth());
  }
  return applyDecorators(ApiBearerAuth(), Roles(...roles));
}
