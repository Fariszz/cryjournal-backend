import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { env } from '../../common/config/env';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  tradeBulkSchema,
  tradeCreateSchema,
  tradeListQuerySchema,
  tradeUpdateSchema,
} from './trades.schemas';
import { TradesService } from './trades.service';

@Controller()
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post('trades')
  @UsePipes(new ZodValidationPipe(tradeCreateSchema))
  async create(@Body() body: unknown) {
    const data = await this.tradesService.create(body as never);
    return { data };
  }

  @Put('trades/:id')
  @UsePipes(new ZodValidationPipe(tradeUpdateSchema))
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = await this.tradesService.update(id, body as never);
    return { data };
  }

  @Get('trades')
  @UsePipes(new ZodValidationPipe(tradeListQuerySchema))
  async list(
    @Query()
    query: {
      account_id?: string;
      instrument_id?: string;
      strategy_id?: string;
      type?: 'executed' | 'missed';
      date_from?: string;
      date_to?: string;
      session?: string;
      tags?: string;
      demons?: string;
      page: number;
      page_size: number;
    },
  ) {
    const data = await this.tradesService.list({
      accountId: query.account_id,
      instrumentId: query.instrument_id,
      strategyId: query.strategy_id,
      type: query.type,
      dateFrom: query.date_from,
      dateTo: query.date_to,
      session: query.session,
      tags: query.tags?.split(',').filter(Boolean),
      demons: query.demons?.split(',').filter(Boolean),
      page: query.page,
      pageSize: query.page_size,
    });
    return {
      data: data.rows,
      meta: data.meta,
    };
  }

  @Get('trades/:id')
  async get(@Param('id') id: string) {
    const data = await this.tradesService.getById(id);
    return { data };
  }

  @Post('trades/bulk')
  @UsePipes(new ZodValidationPipe(tradeBulkSchema))
  async bulk(@Body() body: unknown) {
    const data = await this.tradesService.bulkUpdate(body as never);
    return { data };
  }

  @Post('trade-attachments')
  async uploadAttachment(@Req() req: FastifyRequest) {
    const filePart = await (
      req as FastifyRequest & { file?: () => Promise<any> }
    ).file?.();
    if (!filePart) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Missing multipart file',
      });
    }
    const buffer = await filePart.toBuffer();
    if (buffer.length > env.MAX_UPLOAD_BYTES) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'File too large',
      });
    }
    const tradeId = String(filePart.fields?.trade_id?.value ?? '');
    if (!tradeId) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'trade_id is required',
      });
    }
    const caption = filePart.fields?.caption?.value
      ? String(filePart.fields.caption.value)
      : undefined;
    const data = await this.tradesService.addAttachment(
      tradeId,
      {
        filename: filePart.filename,
        mimetype: filePart.mimetype,
        data: buffer,
      },
      caption,
    );
    return { data };
  }

  @Delete('trade-attachments/:id')
  async deleteAttachment(@Param('id') id: string) {
    const data = await this.tradesService.deleteAttachment(id);
    return { data };
  }
}
