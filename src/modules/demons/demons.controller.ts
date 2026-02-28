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

@Controller('demons')
export class DemonsController {
  constructor(private readonly demonsService: DemonsService) {}

  @Get()
  async list() {
    const data = await this.demonsService.list();
    return { data };
  }

  @Post()
  @UsePipes(new ZodValidationPipe(demonCreateSchema))
  async create(@Body() body: DemonCreateDto) {
    const data = await this.demonsService.create(body);
    return { data };
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(demonIdParamSchema))
  async get(@Param() params: DemonIdParamDto) {
    const data = await this.demonsService.getById(params.id);
    return { data };
  }

  @Put(':id')
  @UsePipes(
    new ZodValidationPipe(demonIdParamSchema),
    new ZodValidationPipe(demonUpdateSchema),
  )
  async update(@Param() params: DemonIdParamDto, @Body() body: DemonUpdateDto) {
    const data = await this.demonsService.update(params.id, body);
    return { data };
  }

  @Post(':id/evidence')
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
  @UsePipes(new ZodValidationPipe(demonIdParamSchema))
  async listEvidence(@Param() params: DemonIdParamDto) {
    const data = await this.demonsService.listEvidence(params.id);
    return { data };
  }

  @Get(':id/performance')
  @UsePipes(new ZodValidationPipe(demonIdParamSchema))
  async performance(@Param() params: DemonIdParamDto) {
    const data = await this.demonsService.performance(params.id);
    return { data };
  }
}
