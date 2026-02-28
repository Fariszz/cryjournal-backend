import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  accountAnalyticsQuerySchema,
  homeAnalyticsQuerySchema,
} from './analytics.schemas';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('home')
  @UsePipes(new ZodValidationPipe(homeAnalyticsQuerySchema))
  async home(
    @Query() query: { date_from: string; date_to: string; account_id?: string },
  ) {
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
    new ZodValidationPipe(
      accountAnalyticsQuerySchema.pick({ date_from: true, date_to: true }),
    ),
  )
  async overview(
    @Param('id') id: string,
    @Query() query: { date_from: string; date_to: string },
  ) {
    const data = await this.analyticsService.accountOverview(id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    return { data, meta: { filters_applied: query } };
  }

  @Get('accounts/:id/instruments')
  @UsePipes(
    new ZodValidationPipe(
      accountAnalyticsQuerySchema.pick({
        date_from: true,
        date_to: true,
        page: true,
        page_size: true,
      }),
    ),
  )
  async instruments(
    @Param('id') id: string,
    @Query()
    query: {
      date_from: string;
      date_to: string;
      page: number;
      page_size: number;
    },
  ) {
    const data = await this.analyticsService.accountInstruments(id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
      page: query.page,
      pageSize: query.page_size,
    });
    return { data: data.rows, meta: data.meta };
  }

  @Get('accounts/:id/sessions')
  @UsePipes(
    new ZodValidationPipe(
      accountAnalyticsQuerySchema.pick({ date_from: true, date_to: true }),
    ),
  )
  async sessions(
    @Param('id') id: string,
    @Query() query: { date_from: string; date_to: string },
  ) {
    const data = await this.analyticsService.accountSessions(id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    return { data };
  }

  @Get('accounts/:id/entry-time-heatmap')
  @UsePipes(
    new ZodValidationPipe(
      accountAnalyticsQuerySchema.pick({ date_from: true, date_to: true }),
    ),
  )
  async heatmap(
    @Param('id') id: string,
    @Query() query: { date_from: string; date_to: string },
  ) {
    const data = await this.analyticsService.accountEntryTimeHeatmap(id, {
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    return { data };
  }

  @Get('accounts/:id/pnl-calendar')
  @UsePipes(
    new ZodValidationPipe(accountAnalyticsQuerySchema.pick({ month: true })),
  )
  async pnlCalendar(
    @Param('id') id: string,
    @Query() query: { month?: string },
  ) {
    const data = await this.analyticsService.accountPnlCalendar(id, {
      month: query.month,
    });
    return { data };
  }

  @Get('accounts/:id/trades/recent')
  @UsePipes(
    new ZodValidationPipe(accountAnalyticsQuerySchema.pick({ limit: true })),
  )
  async recent(@Param('id') id: string, @Query() query: { limit: number }) {
    const data = await this.analyticsService.accountRecentTrades(
      id,
      query.limit,
    );
    return { data };
  }
}
