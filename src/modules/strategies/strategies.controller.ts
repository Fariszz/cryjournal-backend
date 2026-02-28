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
  StrategyCreateDto,
  StrategyIdParamDto,
  strategyIdParamSchema,
  StrategyUpdateDto,
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
  async create(@Body() body: StrategyCreateDto) {
    const data = await this.strategiesService.create(body);
    return { data };
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(strategyIdParamSchema))
  async get(@Param() params: StrategyIdParamDto) {
    const data = await this.strategiesService.getById(params.id);
    return { data };
  }

  @Put(':id')
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
  @UsePipes(new ZodValidationPipe(strategyIdParamSchema))
  async remove(@Param() params: StrategyIdParamDto) {
    const data = await this.strategiesService.remove(params.id);
    return { data };
  }

  @Get(':id/analytics')
  @UsePipes(new ZodValidationPipe(strategyIdParamSchema))
  async analytics(@Param() params: StrategyIdParamDto) {
    const data = await this.strategiesService.analytics(params.id);
    return { data };
  }
}
