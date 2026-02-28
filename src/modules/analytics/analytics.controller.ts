import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  AccountIdParamDto,
  accountIdParamSchema,
  AccountInstrumentsQueryDto,
  accountInstrumentsQuerySchema,
  AccountMonthQueryDto,
  accountMonthQuerySchema,
  AccountOverviewQueryDto,
  accountOverviewQuerySchema,
  AccountRecentTradesQueryDto,
  accountRecentTradesQuerySchema,
  HomeAnalyticsQueryDto,
  homeAnalyticsQuerySchema,
} from './analytics.schemas';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('home')
  @UsePipes(new ZodValidationPipe(homeAnalyticsQuerySchema))
  async home(@Query() query: HomeAnalyticsQueryDto) {
    const data = await this.analyticsService.home({
      dateFrom: query.date_from,
      dateTo: query.date_to,
      accountId: query.account_id,
    });
    return {
      data,
      meta: {
        date_from: query.date_from,
        date_to: query.date_to,
        timezone: 'Asia/Jakarta',
      },
    };
  }

  @Get('accounts/:id/overview')
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountOverviewQuerySchema),
  )
  async overview(
    @Param() params: AccountIdParamDto,
    @Query() query: AccountOverviewQueryDto,
  ) {
    const data = await this.analyticsService.accountOverview(params.id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    return { data, meta: { filters_applied: query } };
  }

  @Get('accounts/:id/instruments')
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountInstrumentsQuerySchema),
  )
  async instruments(
    @Param() params: AccountIdParamDto,
    @Query() query: AccountInstrumentsQueryDto,
  ) {
    const data = await this.analyticsService.accountInstruments(params.id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
      page: query.page,
      pageSize: query.page_size,
    });
    return { data: data.rows, meta: data.meta };
  }

  @Get('accounts/:id/sessions')
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountOverviewQuerySchema),
  )
  async sessions(
    @Param() params: AccountIdParamDto,
    @Query() query: AccountOverviewQueryDto,
  ) {
    const data = await this.analyticsService.accountSessions(params.id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    return { data };
  }

  @Get('accounts/:id/entry-time-heatmap')
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountOverviewQuerySchema),
  )
  async heatmap(
    @Param() params: AccountIdParamDto,
    @Query() query: AccountOverviewQueryDto,
  ) {
    const data = await this.analyticsService.accountEntryTimeHeatmap(
      params.id,
      {
        dateFrom: query.date_from,
        dateTo: query.date_to,
      },
    );
    return { data };
  }

  @Get('accounts/:id/pnl-calendar')
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountMonthQuerySchema),
  )
  async pnlCalendar(
    @Param() params: AccountIdParamDto,
    @Query() query: AccountMonthQueryDto,
  ) {
    const data = await this.analyticsService.accountPnlCalendar(params.id, {
      month: query.month,
    });
    return { data };
  }

  @Get('accounts/:id/trades/recent')
  @UsePipes(
    new ZodValidationPipe(accountIdParamSchema),
    new ZodValidationPipe(accountRecentTradesQuerySchema),
  )
  async recent(
    @Param() params: AccountIdParamDto,
    @Query() query: AccountRecentTradesQueryDto,
  ) {
    const data = await this.analyticsService.accountRecentTrades(
      params.id,
      query.limit,
    );
    return { data };
  }
}
