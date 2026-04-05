import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  createStrategySchema,
  StrategyCreateDto,
  StrategyIdParamDto,
  strategyIdParamSchema,
  StrategyUpdateDto,
  updateStrategySchema,
} from './strategies.schemas';
import { StrategiesService } from './strategies.service';

@ApiTags('Strategies')
@ApiBearerAuth()
@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Get()
  @ApiOperation({
    summary: 'List strategies',
    description: 'Retrieves all strategies.',
  })
  @ApiOkResponse({
    description: 'Strategies retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async list() {
    const data = await this.strategiesService.list();
    return { data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create strategy',
    description: 'Creates a new trading strategy.',
  })
  @ApiBody({
    type: StrategyCreateDto,
    description: 'Payload to create a strategy.',
  })
  @ApiCreatedResponse({
    description: 'Strategy created successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiConflictResponse({ description: 'Strategy already exists.' })
  @UsePipes(new ZodValidationPipe(createStrategySchema))
  async create(@Body() body: StrategyCreateDto) {
    const data = await this.strategiesService.create(body);
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get strategy by ID',
    description: 'Retrieves a strategy by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Strategy identifier.',
    example: '0f9e1884-a06d-4a88-96c2-23d34f08fd79',
  })
  @ApiOkResponse({
    description: 'Strategy retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Strategy was not found.' })
  @UsePipes(new ZodValidationPipe(strategyIdParamSchema))
  async get(@Param() params: StrategyIdParamDto) {
    const data = await this.strategiesService.getById(params.id);
    return { data };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update strategy',
    description: 'Updates strategy fields by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Strategy identifier.',
    example: '0f9e1884-a06d-4a88-96c2-23d34f08fd79',
  })
  @ApiBody({
    type: StrategyUpdateDto,
    description: 'Payload to update strategy fields.',
  })
  @ApiOkResponse({
    description: 'Strategy updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Strategy was not found.' })
  @UsePipes(
    new ZodValidationPipe(strategyIdParamSchema),
    new ZodValidationPipe(updateStrategySchema),
  )
  async update(
    @Param() params: StrategyIdParamDto,
    @Body() body: StrategyUpdateDto,
  ) {
    const data = await this.strategiesService.update(params.id, body);
    return { data };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete strategy',
    description: 'Deletes a strategy by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Strategy identifier.',
    example: '0f9e1884-a06d-4a88-96c2-23d34f08fd79',
  })
  @ApiOkResponse({
    description: 'Strategy deleted successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Strategy was not found.' })
  @UsePipes(new ZodValidationPipe(strategyIdParamSchema))
  async remove(@Param() params: StrategyIdParamDto) {
    const data = await this.strategiesService.remove(params.id);
    return { data };
  }

  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get strategy analytics',
    description: 'Retrieves analytics summary for a strategy.',
  })
  @ApiParam({
    name: 'id',
    description: 'Strategy identifier.',
    example: '0f9e1884-a06d-4a88-96c2-23d34f08fd79',
  })
  @ApiOkResponse({
    description: 'Strategy analytics retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Strategy was not found.' })
  @UsePipes(new ZodValidationPipe(strategyIdParamSchema))
  async analytics(@Param() params: StrategyIdParamDto) {
    const data = await this.strategiesService.analytics(params.id);
    return { data };
  }
}
