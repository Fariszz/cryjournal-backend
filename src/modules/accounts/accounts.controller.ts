import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  AccountCreateDto,
  AccountGroupCreateDto,
  AccountGroupIdParamDto,
  accountGroupIdParamSchema,
  AccountGroupUpdateDto,
  AccountIdParamDto,
  accountIdParamSchema,
  AccountListQueryDto,
  AccountUpdateDto,
  accountCreateSchema,
  accountGroupCreateSchema,
  accountGroupUpdateSchema,
  accountListSchema,
  accountUpdateSchema,
} from './accounts.schemas';
import { AccountArchivedQueryEnum } from '@common/enums/account-archived-query.enum';
import { AccountsService } from './accounts.service';
import {
  CurrentUser,
  type RequestUser,
} from '@common/auth/current-user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  private getCurrentUserId(user: RequestUser | undefined): string {
    console.log('Getting current user ID for user:', user);

    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }
    return user.id;
  }

  @Get('account-groups')
  @ApiOperation({
    summary: 'List account groups',
    description:
      'Retrieves all account groups owned by the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Account groups retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
            name: 'Futures Accounts',
            description: 'Group for derivatives trading accounts',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
    schema: {
      example: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required',
          details: [],
        },
        meta: {
          path: '/api/v1/account-groups',
          method: 'GET',
        },
      },
    },
  })
  async listGroups(@CurrentUser() user: RequestUser | undefined) {
    const data = await this.accountsService.listGroups(
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Post('account-groups')
  @ApiOperation({
    summary: 'Create a new account group',
    description: 'Creates a new account group for the authenticated user.',
  })
  @ApiBody({
    type: AccountGroupCreateDto,
    description: 'The details of the account group to create',
  })
  @ApiCreatedResponse({
    description: 'Account group created successfully.',
    schema: {
      example: {
        data: {
          id: '9e305f2e-6f28-4910-a67f-3ba940f6688f',
          name: 'Scalping Group',
          description: 'Group for high-frequency setups',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request payload is invalid.',
    schema: {
      example: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: [{ field: 'name', message: 'Required' }],
        },
        meta: {
          path: '/api/v1/account-groups',
          method: 'POST',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
    schema: {
      example: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required',
          details: [],
        },
        meta: {
          path: '/api/v1/account-groups',
          method: 'POST',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'An account group with the same name already exists.',
    schema: {
      example: {
        error: {
          code: 'CONFLICT',
          message: 'Account group already exists',
          details: [],
        },
        meta: {
          path: '/api/v1/account-groups',
          method: 'POST',
        },
      },
    },
  })
  async createGroup(
    @Body(new ZodValidationPipe(accountGroupCreateSchema))
    body: AccountGroupCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.createGroup(
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Put('account-groups/:id')
  @ApiOperation({
    summary: 'Update account group',
    description: 'Updates account group fields by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account group identifier.',
    example: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
  })
  @ApiBody({
    type: AccountGroupUpdateDto,
    description: 'Payload to update account group data.',
  })
  @ApiOkResponse({
    description: 'Account group updated successfully.',
    schema: {
      example: {
        data: {
          id: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
          name: 'Updated Futures Accounts',
          description: 'Updated group description',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiNotFoundResponse({
    description: 'Account group was not found.',
  })
  async updateGroup(
    @Param(new ZodValidationPipe(accountGroupIdParamSchema))
    params: AccountGroupIdParamDto,
    @Body(new ZodValidationPipe(accountGroupUpdateSchema))
    body: AccountGroupUpdateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.updateGroup(
      params.id,
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Post('accounts')
  @ApiOperation({
    summary: 'Create account',
    description: 'Creates a new trading account for the authenticated user.',
  })
  @ApiBody({
    type: AccountCreateDto,
    description: 'Payload to create a trading account.',
  })
  @ApiCreatedResponse({
    description: 'Account created successfully.',
    schema: {
      example: {
        data: {
          id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          name: 'Binance Futures',
          broker: 'Binance',
          accountType: 'CRYPTO',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiConflictResponse({
    description: 'An account with the same name already exists.',
  })
  async createAccount(
    @Body(new ZodValidationPipe(accountCreateSchema)) body: AccountCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.createAccount(
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'List accounts',
    description: 'Retrieves accounts using optional filtering parameters.',
  })
  @ApiQuery({
    name: 'group_id',
    required: false,
    description: 'Filter accounts by account group identifier.',
    example: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
  })
  @ApiQuery({
    name: 'archived',
    required: false,
    enum: AccountArchivedQueryEnum,
    description: 'Filter accounts by archived status.',
  })
  @ApiOkResponse({
    description: 'Accounts retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
            name: 'Binance Futures',
            archivedAt: null,
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async listAccounts(
    @Query(new ZodValidationPipe(accountListSchema)) query: AccountListQueryDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.listAccounts({
      userId: this.getCurrentUserId(user),
      groupId: query.group_id,
      archived: query.archived
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
          query.archived === AccountArchivedQueryEnum.TRUE
        : undefined,
    });
    return { data };
  }

  @Put('accounts/:id')
  @ApiOperation({
    summary: 'Update account',
    description: 'Updates account details by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiBody({
    type: AccountUpdateDto,
    description: 'Payload to update account fields.',
  })
  @ApiOkResponse({
    description: 'Account updated successfully.',
    schema: {
      example: {
        data: {
          id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          name: 'Bybit Futures',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Account was not found.' })
  async updateAccount(
    @Param(new ZodValidationPipe(accountIdParamSchema))
    params: AccountIdParamDto,
    @Body(new ZodValidationPipe(accountUpdateSchema)) body: AccountUpdateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.updateAccount(
      params.id,
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Post('accounts/:id/archive')
  @ApiOperation({
    summary: 'Archive account',
    description: 'Archives an account by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiCreatedResponse({
    description: 'Account archived successfully.',
    schema: {
      example: {
        data: {
          id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          archivedAt: '2026-04-05T10:15:30.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Account was not found.' })
  async archiveAccount(
    @Param(new ZodValidationPipe(accountIdParamSchema))
    params: AccountIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.archiveAccount(
      params.id,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Post('accounts/:id/restore')
  @ApiOperation({
    summary: 'Restore account',
    description: 'Restores an archived account by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiCreatedResponse({
    description: 'Account restored successfully.',
    schema: {
      example: {
        data: {
          id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          archivedAt: null,
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Account was not found.' })
  async restoreAccount(
    @Param(new ZodValidationPipe(accountIdParamSchema))
    params: AccountIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.restoreAccount(
      params.id,
      this.getCurrentUserId(user),
    );
    return { data };
  }
}
