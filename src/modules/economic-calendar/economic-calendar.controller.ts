import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';

import {
  attachContextEventSchema,
  economicCalendarQuerySchema,
} from './economic-calendar.schemas';
import { EconomicCalendarService } from './economic-calendar.service';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@Controller()
export class EconomicCalendarController {
  constructor(
    private readonly economicCalendarService: EconomicCalendarService,
  ) {}

  @Get('economic-calendar')
  @UsePipes(new ZodValidationPipe(economicCalendarQuerySchema))
  async getEvents(
    @Query()
    query: {
      from: string;
      to: string;
      impact?: string;
      currency?: string;
    },
  ) {
    const data = await this.economicCalendarService.getEvents(query);
    return { data };
  }

  @Post('trades/:id/context-events')
  @UsePipes(new ZodValidationPipe(attachContextEventSchema))
  async attach(
    @Param('id') id: string,
    @Body()
    body: {
      providerEventId: string;
      title: string;
      impact?: string;
      currency?: string;
      eventTime: string;
      raw?: Record<string, unknown>;
    },
  ) {
    const data = await this.economicCalendarService.attachEventToTrade(
      id,
      body,
    );
    return { data };
  }
}
