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
  AttachContextEventDto,
  attachContextEventSchema,
  EconomicCalendarQueryDto,
  economicCalendarQuerySchema,
  TradeIdParamDto,
  tradeIdParamSchema,
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
  async getEvents(@Query() query: EconomicCalendarQueryDto) {
    const data = await this.economicCalendarService.getEvents(query);
    return { data };
  }

  @Post('trades/:id/context-events')
  @UsePipes(
    new ZodValidationPipe(tradeIdParamSchema),
    new ZodValidationPipe(attachContextEventSchema),
  )
  async attach(
    @Param() params: TradeIdParamDto,
    @Body() body: AttachContextEventDto,
  ) {
    const data = await this.economicCalendarService.attachEventToTrade(
      params.id,
      body,
    );
    return { data };
  }
}
