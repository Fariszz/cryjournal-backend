import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRoleEnum } from '@common/enums/user-role.enum';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import {
  type AdminUsersQuery,
  adminUsersQuerySchema,
} from './schemas/admin-users-query.schema';
import {
  type UpdateUserActiveStatusInput,
  updateUserActiveStatusSchema,
} from './schemas/update-user-active-status.schema';
import {
  type UpdateUserRolesInput,
  updateUserRolesSchema,
} from './schemas/update-user-roles.schema';
import { UsersService } from './users.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(UserRoleEnum.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(adminUsersQuerySchema)) query: AdminUsersQuery,
  ) {
    const data = await this.usersService.listUsers(query.page, query.limit);
    return { data };
  }

  @Patch(':id/roles')
  async assignRoles(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body(new ZodValidationPipe(updateUserRolesSchema))
    body: UpdateUserRolesInput,
  ) {
    const data = await this.usersService.assignRoles(userId, body.roles);
    return { data };
  }

  @Patch(':id/activate')
  async updateActiveState(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body(new ZodValidationPipe(updateUserActiveStatusSchema))
    body: UpdateUserActiveStatusInput,
  ) {
    const data = await this.usersService.setActive(userId, body.isActive);
    return { data };
  }
}
