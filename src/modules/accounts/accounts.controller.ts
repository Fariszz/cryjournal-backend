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
  async createGroup(@Body() body: unknown) {
    const data = await this.accountsService.createGroup(body as never);
    return { data };
  }

  @Put('account-groups/:id')
  @UsePipes(new ZodValidationPipe(accountGroupUpdateSchema))
  async updateGroup(@Param('id') id: string, @Body() body: unknown) {
    const data = await this.accountsService.updateGroup(id, body as never);
    return { data };
  }

  @Post('accounts')
  @UsePipes(new ZodValidationPipe(accountCreateSchema))
  async createAccount(@Body() body: unknown) {
    const data = await this.accountsService.createAccount(body as never);
    return { data };
  }

  @Get('accounts')
  @UsePipes(new ZodValidationPipe(accountListSchema))
  async listAccounts(
    @Query() query: { group_id?: string; archived?: 'true' | 'false' },
  ) {
    const data = await this.accountsService.listAccounts({
      groupId: query.group_id,
      archived: query.archived ? query.archived === 'true' : undefined,
    });
    return { data };
  }

  @Put('accounts/:id')
  @UsePipes(new ZodValidationPipe(accountUpdateSchema))
  async updateAccount(@Param('id') id: string, @Body() body: unknown) {
    const data = await this.accountsService.updateAccount(id, body as never);
    return { data };
  }

  @Post('accounts/:id/archive')
  async archiveAccount(@Param('id') id: string) {
    const data = await this.accountsService.archiveAccount(id);
    return { data };
  }

  @Post('accounts/:id/restore')
  async restoreAccount(@Param('id') id: string) {
    const data = await this.accountsService.restoreAccount(id);
    return { data };
  }
}
