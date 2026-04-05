import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import {
  CurrentUser,
  type RequestUser,
} from '@common/auth/current-user.decorator';

@ApiTags('Strategies')
@ApiBearerAuth()
@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}
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
    summary: 'List strategies',
    description: 'Retrieves all strategies.',
  })
  @ApiOkResponse({
    description: 'Strategies retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async list(@CurrentUser() user: RequestUser | undefined) {
    const data = await this.strategiesService.list(this.getCurrentUserId(user));
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
  async create(
    @Body() body: StrategyCreateDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.strategiesService.create(
      body,
      this.getCurrentUserId(user),
    );
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
  async get(
    @Param() params: StrategyIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.strategiesService.getById(
      params.id,
      this.getCurrentUserId(user),
    );
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
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.strategiesService.update(
      params.id,
      body,
      this.getCurrentUserId(user),
    );
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
  async remove(
    @Param() params: StrategyIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.strategiesService.remove(
      params.id,
      this.getCurrentUserId(user),
    );
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
  async analytics(
    @Param() params: StrategyIdParamDto,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const data = await this.strategiesService.analytics(
      params.id,
      this.getCurrentUserId(user),
    );
    return { data };
  }
}
