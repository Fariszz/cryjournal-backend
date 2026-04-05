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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('Economic Calendar')
@ApiBearerAuth()
@Controller()
export class EconomicCalendarController {
  constructor(
    private readonly economicCalendarService: EconomicCalendarService,
  ) {}

  @Get('economic-calendar')
  @ApiOperation({
    summary: 'Get economic calendar events',
    description: 'Retrieves economic events in a specified date-time range.',
  })
  @ApiQuery({
    name: 'from',
    required: true,
    description: 'Range start date-time in ISO 8601 format.',
    example: '2026-04-05T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: 'Range end date-time in ISO 8601 format.',
    example: '2026-04-06T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'impact',
    required: false,
    description: 'Optional impact level filter.',
    example: 'high',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    description: 'Optional currency filter.',
    example: 'USD',
  })
  @ApiOkResponse({
    description: 'Economic events retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(economicCalendarQuerySchema))
  async getEvents(@Query() query: EconomicCalendarQueryDto) {
    const data = await this.economicCalendarService.getEvents(query);
    return { data };
  }

  @Post('trades/:id/context-events')
  @ApiOperation({
    summary: 'Attach context event to trade',
    description: 'Attaches an economic calendar event context to a trade.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trade identifier.',
    example: '72e52434-a5df-4859-a563-09af31a89b8c',
  })
  @ApiBody({
    type: AttachContextEventDto,
    description: 'Economic event payload attached to a trade.',
  })
  @ApiCreatedResponse({
    description: 'Context event attached successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
