import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  InstrumentCreateDto,
  instrumentCreateSchema,
} from './instruments.schemas';
import { InstrumentsService } from './instruments.service';

@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  async list() {
    const data = await this.instrumentsService.list();
    return { data };
  }

  @Post()
  @UsePipes(new ZodValidationPipe(instrumentCreateSchema))
  async create(@Body() body: InstrumentCreateDto) {
    const data = await this.instrumentsService.create(body);
    return { data };
  }
}
