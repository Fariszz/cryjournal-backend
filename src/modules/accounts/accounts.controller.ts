import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UsePipes,
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
import { CurrentUser, type RequestUser } from '@common/auth/current-user.decorator';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  private getCurrentUserId(user: RequestUser | undefined): string {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }
    return user.id;
  }

  @Get('account-groups')
  async listGroups(@CurrentUser() user: RequestUser | undefined) {
    const data = await this.accountsService.listGroups(
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Post('account-groups')
  @UsePipes(new ZodValidationPipe(accountGroupCreateSchema))
  async createGroup(
    @Body() body: AccountGroupCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.createGroup(
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Put('account-groups/:id')
  @UsePipes(
    new ZodValidationPipe(accountGroupIdParamSchema),
    new ZodValidationPipe(accountGroupUpdateSchema),
  )
  async updateGroup(
    @Param() params: AccountGroupIdParamDto,
    @Body() body: AccountGroupUpdateDto,
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
  @UsePipes(new ZodValidationPipe(accountCreateSchema))
  async createAccount(
    @Body() body: AccountCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.createAccount(
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Get('accounts')
  @UsePipes(new ZodValidationPipe(accountListSchema))
  async listAccounts(
    @Query() query: AccountListQueryDto,
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
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountUpdateSchema),
  )
  async updateAccount(
    @Param() params: AccountIdParamDto,
    @Body() body: AccountUpdateDto,
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
  @UsePipes(new ZodValidationPipe(accountIdParamSchema))
  async archiveAccount(
    @Param() params: AccountIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.archiveAccount(
      params.id,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Post('accounts/:id/restore')
  @UsePipes(new ZodValidationPipe(accountIdParamSchema))
  async restoreAccount(
    @Param() params: AccountIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.accountsService.restoreAccount(
      params.id,
      this.getCurrentUserId(user),
    );
    return { data };
  }
}
