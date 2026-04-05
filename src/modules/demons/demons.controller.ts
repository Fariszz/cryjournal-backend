import {
  Body,
  Controller,
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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DemonsService } from './demons.service';
import {
  DemonCreateDto,
  demonCreateSchema,
  DemonIdParamDto,
  demonIdParamSchema,
  DemonUpdateDto,
  demonUpdateSchema,
  EvidenceCreateDto,
  evidenceCreateSchema,
} from './demons.schemas';

@ApiTags('Demons')
@ApiBearerAuth()
@Controller('demons')
export class DemonsController {
  constructor(private readonly demonsService: DemonsService) {}

  @Get()
  @ApiOperation({
    summary: 'List demons',
    description: 'Retrieves all trading demons for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Demons retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async list() {
    const data = await this.demonsService.list();
    return { data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create demon',
    description: 'Creates a new trading demon definition.',
  })
  @ApiBody({ type: DemonCreateDto, description: 'Payload to create a demon.' })
  @ApiCreatedResponse({
    description: 'Demon created successfully.',
    schema: {
      example: {
        data: { id: 'f6f80fd1-af2a-495a-903d-48d2db5688fe', name: 'FOMO' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(demonCreateSchema))
  async create(@Body() body: DemonCreateDto) {
    const data = await this.demonsService.create(body);
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get demon by ID',
    description: 'Retrieves a demon by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Demon identifier.',
    example: 'f6f80fd1-af2a-495a-903d-48d2db5688fe',
  })
  @ApiOkResponse({
    description: 'Demon retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Demon was not found.' })
  @UsePipes(new ZodValidationPipe(demonIdParamSchema))
  async get(@Param() params: DemonIdParamDto) {
    const data = await this.demonsService.getById(params.id);
    return { data };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update demon',
    description: 'Updates demon fields by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Demon identifier.',
    example: 'f6f80fd1-af2a-495a-903d-48d2db5688fe',
  })
  @ApiBody({
    type: DemonUpdateDto,
    description: 'Payload to update demon fields.',
  })
  @ApiOkResponse({
    description: 'Demon updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Demon was not found.' })
  @UsePipes(
    new ZodValidationPipe(demonIdParamSchema),
    new ZodValidationPipe(demonUpdateSchema),
  )
  async update(@Param() params: DemonIdParamDto, @Body() body: DemonUpdateDto) {
    const data = await this.demonsService.update(params.id, body);
    return { data };
  }

  @Post(':id/evidence')
  @ApiOperation({
    summary: 'Create demon evidence',
    description: 'Adds evidence log entry for a demon.',
  })
  @ApiParam({
    name: 'id',
    description: 'Demon identifier.',
    example: 'f6f80fd1-af2a-495a-903d-48d2db5688fe',
  })
  @ApiBody({
    type: EvidenceCreateDto,
    description: 'Payload to create demon evidence.',
  })
  @ApiCreatedResponse({
    description: 'Demon evidence created successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Demon was not found.' })
  @UsePipes(
    new ZodValidationPipe(demonIdParamSchema),
    new ZodValidationPipe(evidenceCreateSchema),
  )
  async createEvidence(
    @Param() params: DemonIdParamDto,
    @Body() body: EvidenceCreateDto,
  ) {
    const data = await this.demonsService.createEvidence(params.id, body);
    return { data };
  }

  @Get(':id/evidence')
  @ApiOperation({
    summary: 'List demon evidence',
    description: 'Retrieves evidence logs for a demon.',
  })
  @ApiParam({
    name: 'id',
    description: 'Demon identifier.',
    example: 'f6f80fd1-af2a-495a-903d-48d2db5688fe',
  })
  @ApiOkResponse({
    description: 'Demon evidence retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Demon was not found.' })
  @UsePipes(new ZodValidationPipe(demonIdParamSchema))
  async listEvidence(@Param() params: DemonIdParamDto) {
    const data = await this.demonsService.listEvidence(params.id);
    return { data };
  }

  @Get(':id/performance')
  @ApiOperation({
    summary: 'Get demon performance',
    description: 'Returns performance analytics for a demon.',
  })
  @ApiParam({
    name: 'id',
    description: 'Demon identifier.',
    example: 'f6f80fd1-af2a-495a-903d-48d2db5688fe',
  })
  @ApiOkResponse({
    description: 'Demon performance retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Demon was not found.' })
  @UsePipes(new ZodValidationPipe(demonIdParamSchema))
  async performance(@Param() params: DemonIdParamDto) {
    const data = await this.demonsService.performance(params.id);
    return { data };
  }
}
