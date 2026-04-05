import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
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
import {
  CurrentUser,
  type RequestUser,
} from '@common/auth/current-user.decorator';

@ApiTags('Instruments')
@ApiBearerAuth()
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}
  private getCurrentUserId(user: RequestUser | undefined): string {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }
    return user.id;
  }

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
  async list(@CurrentUser() user: RequestUser | undefined) {
    const data = await this.instrumentsService.list(
      this.getCurrentUserId(user),
    );
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
  async create(
    @Body() body: InstrumentCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.instrumentsService.create(
      body,
      this.getCurrentUserId(user),
    );
    return { data };
  }
}
