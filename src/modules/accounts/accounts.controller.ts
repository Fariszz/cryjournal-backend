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
  SelectOptionListResponseDto,
  AccountUpdateDto,
  accountBulkCreateSchema,
  accountBulkUpdateSchema,
  accountCreateSchema,
  accountGroupCreateSchema,
  accountGroupUpdateSchema,
  accountListSchema,
  accountUpdateSchema,
} from './accounts.schemas';
import type {
  AccountBulkCreateDto,
  AccountBulkUpdateDto,
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
import { ZodResponse } from 'nestjs-zod';

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
            accountCount: 3,
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

  @Get('account-groups/:id')
  @ApiOperation({
    summary: 'Get account group detail',
    description: 'Retrieves an account group by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account group identifier.',
    example: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
  })
  @ApiOkResponse({
    description: 'Account group retrieved successfully.',
    schema: {
      example: {
        data: {
          id: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
          name: 'Futures Accounts',
          description: 'Group for derivatives trading accounts',
          accountCount: 3,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request parameter is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiNotFoundResponse({
    description: 'Account group was not found.',
  })
  async getGroup(
    @Param(new ZodValidationPipe(accountGroupIdParamSchema))
    params: AccountGroupIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.getGroup(
      params.id,
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

  @Get('accounts/account-types')
  @ZodResponse({
    status: 200,
    description: 'Account type options retrieved successfully.',
    type: SelectOptionListResponseDto,
  })
  @ApiOperation({
    summary: 'List account type options',
    description: 'Retrieves static account type select options.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  listAccountTypeOptions() {
    const data = this.accountsService.listAccountTypeOptions();
    return { data };
  }

  @Get('accounts/currencies')
  @ZodResponse({
    status: 200,
    description: 'Currency options retrieved successfully.',
    type: SelectOptionListResponseDto,
  })
  @ApiOperation({
    summary: 'List currency options',
    description: 'Retrieves static base currency select options.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  listCurrencyOptions() {
    const data = this.accountsService.listCurrencyOptions();
    return { data };
  }

  @Get('accounts/brokers')
  @ZodResponse({
    status: 200,
    description: 'Broker options retrieved successfully.',
    type: SelectOptionListResponseDto,
  })
  @ApiOperation({
    summary: 'List broker options',
    description: 'Retrieves static broker select options.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  listBrokerOptions() {
    const data = this.accountsService.listBrokerOptions();
    return { data };
  }

  @Get('accounts/timezones')
  @ZodResponse({
    status: 200,
    description: 'Timezone options retrieved successfully.',
    type: SelectOptionListResponseDto,
  })
  @ApiOperation({
    summary: 'List timezone options',
    description: 'Retrieves static IANA timezone select options.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  listTimezoneOptions() {
    const data = this.accountsService.listTimezoneOptions();
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

  @Post('accounts/bulk')
  @ApiOperation({
    summary: 'Bulk create accounts',
    description:
      'Creates multiple trading accounts for the authenticated user in a single atomic request.',
  })
  @ApiBody({
    description: 'Payload to create multiple trading accounts.',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/AccountCreateDto' },
      example: [
        {
          name: 'Binance Futures',
          broker: 'binance',
          accountType: 'crypto',
          baseCurrency: 'USD',
          timezone: 'Asia/Jakarta',
        },
      ],
    },
  })
  @ApiCreatedResponse({
    description: 'Accounts created successfully.',
    schema: {
      example: {
        data: [
          {
            id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
            name: 'Binance Futures',
            broker: 'Binance',
            accountType: 'CRYPTO',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({
    description: 'One or more account groups were not found.',
  })
  async createAccounts(
    @Body(new ZodValidationPipe(accountBulkCreateSchema))
    body: AccountBulkCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.createAccounts(
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
        ? query.archived === AccountArchivedQueryEnum.TRUE
        : undefined,
    });
    return { data };
  }

  @Get('accounts/:id')
  @ApiOperation({
    summary: 'Get account detail',
    description: 'Retrieves a trading account by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiOkResponse({
    description: 'Account retrieved successfully.',
    schema: {
      example: {
        data: {
          id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          groupId: 'f1f3a3e1-5d9f-4584-a704-f0fc641b7788',
          name: 'Binance Futures',
          broker: 'Binance',
          accountType: 'CRYPTO',
          baseCurrency: 'USD',
          timezone: 'Asia/Jakarta',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request parameter is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Account was not found.' })
  async getAccount(
    @Param(new ZodValidationPipe(accountIdParamSchema))
    params: AccountIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.getAccount(
      params.id,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Put('accounts/bulk')
  @ApiOperation({
    summary: 'Bulk update accounts',
    description:
      'Updates multiple trading accounts with per-account payloads in a single atomic request.',
  })
  @ApiBody({
    description: 'Payload to update multiple trading accounts.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          },
          name: { type: 'string', example: 'Bybit Futures' },
          broker: { type: 'string', example: 'bybit' },
          accountType: { type: 'string', example: 'crypto' },
          baseCurrency: { type: 'string', example: 'USD' },
          timezone: { type: 'string', example: 'Asia/Jakarta' },
        },
      },
      example: [
        {
          id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
          name: 'Bybit Futures',
        },
      ],
    },
  })
  @ApiOkResponse({
    description: 'Accounts updated successfully.',
    schema: {
      example: {
        data: [
          {
            id: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
            name: 'Bybit Futures',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({
    description: 'One or more accounts or account groups were not found.',
  })
  async updateAccounts(
    @Body(new ZodValidationPipe(accountBulkUpdateSchema))
    body: AccountBulkUpdateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.updateAccounts(
      body,
      this.getCurrentUserId(user),
    );
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
