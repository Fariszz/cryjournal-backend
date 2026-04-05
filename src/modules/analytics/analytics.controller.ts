import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('home')
  @ApiOperation({
    summary: 'Get home analytics',
    description: 'Returns aggregated analytics for the dashboard home view.',
  })
  @ApiQuery({
    name: 'date_from',
    required: true,
    description: 'Start date-time in ISO 8601 format.',
    example: '2026-04-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'date_to',
    required: true,
    description: 'End date-time in ISO 8601 format.',
    example: '2026-04-05T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'account_id',
    required: false,
    description: 'Optional account identifier filter.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiOkResponse({
    description: 'Home analytics retrieved successfully.',
    schema: {
      example: {
        data: {
          totalTrades: 24,
          winRate: 58.3,
        },
        meta: {
          date_from: '2026-04-01T00:00:00.000Z',
          date_to: '2026-04-05T23:59:59.999Z',
          timezone: 'Asia/Jakarta',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get account overview analytics',
    description: 'Returns summary analytics for a specific account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiQuery({
    name: 'date_from',
    required: true,
    description: 'Start date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'date_to',
    required: true,
    description: 'End date-time in ISO 8601 format.',
  })
  @ApiOkResponse({
    description: 'Account overview retrieved successfully.',
    schema: { example: { data: {}, meta: { filters_applied: {} } } },
  })
  @ApiBadRequestResponse({
    description: 'Path or query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get account instrument analytics',
    description:
      'Returns paginated analytics grouped by instrument for an account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiQuery({
    name: 'date_from',
    required: true,
    description: 'Start date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'date_to',
    required: true,
    description: 'End date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number.',
    example: 1,
  })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: 'Number of items per page.',
    example: 20,
  })
  @ApiOkResponse({
    description: 'Instrument analytics retrieved successfully.',
    schema: {
      example: {
        data: [],
        meta: { page: 1, page_size: 20, total_items: 0, total_pages: 0 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Path or query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get account session analytics',
    description: 'Returns trading-session analytics for an account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiQuery({
    name: 'date_from',
    required: true,
    description: 'Start date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'date_to',
    required: true,
    description: 'End date-time in ISO 8601 format.',
  })
  @ApiOkResponse({
    description: 'Session analytics retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({
    description: 'Path or query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get account entry time heatmap',
    description: 'Returns heatmap analytics for entry times by account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiQuery({
    name: 'date_from',
    required: true,
    description: 'Start date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'date_to',
    required: true,
    description: 'End date-time in ISO 8601 format.',
  })
  @ApiOkResponse({
    description: 'Heatmap analytics retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({
    description: 'Path or query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get account PnL calendar',
    description:
      'Returns monthly profit-and-loss calendar analytics for an account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Target month in YYYY-MM format. Defaults to current month.',
    example: '2026-04',
  })
  @ApiOkResponse({
    description: 'PnL calendar retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({
    description: 'Path or query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get recent account trades',
    description: 'Returns the most recent trades for a specific account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Account identifier.',
    example: '5a8f198f-31ef-4584-b806-e4f57ff52cb6',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of trades to return.',
    example: 5,
  })
  @ApiOkResponse({
    description: 'Recent trades retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({
    description: 'Path or query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
