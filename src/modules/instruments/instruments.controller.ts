import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  InstrumentCreateDto,
  instrumentCreateSchema,
} from './instruments.schemas';
import { InstrumentsService } from './instruments.service';

@ApiTags('Instruments')
@ApiBearerAuth()
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List instruments',
    description:
      'Retrieves all instruments for the authenticated user context.',
  })
  @ApiOkResponse({
    description: 'Instruments retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async list() {
    const data = await this.instrumentsService.list();
    return { data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create instrument',
    description: 'Creates a new instrument definition.',
  })
  @ApiBody({
    type: InstrumentCreateDto,
    description: 'Payload to create an instrument.',
  })
  @ApiCreatedResponse({
    description: 'Instrument created successfully.',
    schema: {
      example: {
        data: {
          id: 'f26f6d39-8ecf-4f46-ba1e-d23cb645823f',
          symbol: 'BTCUSDT',
          category: 'crypto',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiConflictResponse({ description: 'Instrument already exists.' })
  @UsePipes(new ZodValidationPipe(instrumentCreateSchema))
  async create(@Body() body: InstrumentCreateDto) {
    const data = await this.instrumentsService.create(body);
    return { data };
  }
}
