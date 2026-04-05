import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'List users (admin)',
    description: 'Retrieves paginated users list for administrators.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page.',
    example: 20,
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  async list(
    @Query(new ZodValidationPipe(adminUsersQuerySchema)) query: AdminUsersQuery,
  ) {
    const data = await this.usersService.listUsers(query.page, query.limit);
    return { data };
  }

  @Patch(':id/roles')
  @ApiOperation({
    summary: 'Assign user roles (admin)',
    description: 'Assigns one or more roles to a specific user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: '2ce9ec65-2dcd-4474-85f9-84f941410814',
  })
  @ApiBody({
    schema: {
      example: {
        roles: ['TRADER', 'ADMIN'],
      },
    },
  })
  @ApiOkResponse({
    description: 'User roles updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  async assignRoles(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body(new ZodValidationPipe(updateUserRolesSchema))
    body: UpdateUserRolesInput,
  ) {
    const data = await this.usersService.assignRoles(userId, body.roles);
    return { data };
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Update user active status (admin)',
    description: 'Activates or deactivates a user account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: '2ce9ec65-2dcd-4474-85f9-84f941410814',
  })
  @ApiBody({
    schema: {
      example: {
        isActive: true,
      },
    },
  })
  @ApiOkResponse({
    description: 'User active status updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  async updateActiveState(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body(new ZodValidationPipe(updateUserActiveStatusSchema))
    body: UpdateUserActiveStatusInput,
  ) {
    const data = await this.usersService.setActive(userId, body.isActive);
    return { data };
  }
}
