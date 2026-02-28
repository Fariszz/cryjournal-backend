import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { AccountsService } from './accounts.service';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('account-groups')
  async listGroups() {
    const data = await this.accountsService.listGroups();
    return { data };
  }

  @Post('account-groups')
  @UsePipes(new ZodValidationPipe(accountGroupCreateSchema))
  async createGroup(@Body() body: AccountGroupCreateDto) {
    const data = await this.accountsService.createGroup(body);
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
  ) {
    const data = await this.accountsService.updateGroup(params.id, body);
    return { data };
  }

  @Post('accounts')
  @UsePipes(new ZodValidationPipe(accountCreateSchema))
  async createAccount(@Body() body: AccountCreateDto) {
    const data = await this.accountsService.createAccount(body);
    return { data };
  }

  @Get('accounts')
  @UsePipes(new ZodValidationPipe(accountListSchema))
  async listAccounts(@Query() query: AccountListQueryDto) {
    const data = await this.accountsService.listAccounts({
      groupId: query.group_id,
      archived: query.archived ? query.archived === 'true' : undefined,
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
  ) {
    const data = await this.accountsService.updateAccount(params.id, body);
    return { data };
  }

  @Post('accounts/:id/archive')
  @UsePipes(new ZodValidationPipe(accountIdParamSchema))
  async archiveAccount(@Param() params: AccountIdParamDto) {
    const data = await this.accountsService.archiveAccount(params.id);
    return { data };
  }

  @Post('accounts/:id/restore')
  @UsePipes(new ZodValidationPipe(accountIdParamSchema))
  async restoreAccount(@Param() params: AccountIdParamDto) {
    const data = await this.accountsService.restoreAccount(params.id);
    return { data };
  }
}
