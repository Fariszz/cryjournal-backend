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
  createStrategySchema,
  updateStrategySchema,
} from './strategies.schemas';
import { StrategiesService } from './strategies.service';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Get()
  async list() {
    const data = await this.strategiesService.list();
    return { data };
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createStrategySchema))
  async create(@Body() body: unknown) {
    const data = await this.strategiesService.create(body as never);
    return { data };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.strategiesService.getById(id);
    return { data };
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateStrategySchema))
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = await this.strategiesService.update(id, body as never);
    return { data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.strategiesService.remove(id);
    return { data };
  }

  @Get(':id/analytics')
  async analytics(@Param('id') id: string) {
    const data = await this.strategiesService.analytics(id);
    return { data };
  }
}
