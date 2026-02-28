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
  async get(@Param('id') id: string) {
    const data = await this.demonsService.getById(id);
    return { data };
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(demonUpdateSchema))
  async update(@Param('id') id: string, @Body() body: DemonUpdateDto) {
    const data = await this.demonsService.update(id, body as never);
    return { data };
  }

  @Post(':id/evidence')
  @UsePipes(new ZodValidationPipe(evidenceCreateSchema))
  async createEvidence(
    @Param('id') id: string,
    @Body() body: EvidenceCreateDto,
  ) {
    const data = await this.demonsService.createEvidence(id, body);
    return { data };
  }

  @Get(':id/evidence')
  async listEvidence(@Param('id') id: string) {
    const data = await this.demonsService.listEvidence(id);
    return { data };
  }

  @Get(':id/performance')
  async performance(@Param('id') id: string) {
    const data = await this.demonsService.performance(id);
    return { data };
  }
}
