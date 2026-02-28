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
  TradeAttachmentIdParamDto,
  tradeAttachmentIdParamSchema,
  TradeBulkDto,
  tradeBulkSchema,
  TradeCreateDto,
  tradeCreateSchema,
  TradeIdParamDto,
  tradeIdParamSchema,
  TradeListQueryDto,
  tradeListQuerySchema,
  TradeUpdateDto,
  tradeUpdateSchema,
} from './trades.schemas';
import { TradesService } from './trades.service';

@Controller()
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post('trades')
  @UsePipes(new ZodValidationPipe(tradeCreateSchema))
  async create(@Body() body: TradeCreateDto) {
    const data = await this.tradesService.create(body);
    return { data };
  }

  @Put('trades/:id')
  @UsePipes(
    new ZodValidationPipe(tradeIdParamSchema),
    new ZodValidationPipe(tradeUpdateSchema),
  )
  async update(@Param() params: TradeIdParamDto, @Body() body: TradeUpdateDto) {
    const data = await this.tradesService.update(params.id, body);
    return { data };
  }

  @Get('trades')
  @UsePipes(new ZodValidationPipe(tradeListQuerySchema))
  async list(@Query() query: TradeListQueryDto) {
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
  @UsePipes(new ZodValidationPipe(tradeIdParamSchema))
  async get(@Param() params: TradeIdParamDto) {
    const data = await this.tradesService.getById(params.id);
    return { data };
  }

  @Post('trades/bulk')
  @UsePipes(new ZodValidationPipe(tradeBulkSchema))
  async bulk(@Body() body: TradeBulkDto) {
    const data = await this.tradesService.bulkUpdate(body);
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
    const fields = filePart.fields as
      | Record<string, { value?: unknown } | undefined>
      | undefined;
    const tradeId = String(fields?.trade_id?.value ?? '');
    if (!tradeId) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'trade_id is required',
      });
    }
    const caption = fields?.caption?.value
      ? String(fields.caption.value)
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
  @UsePipes(new ZodValidationPipe(tradeAttachmentIdParamSchema))
  async deleteAttachment(@Param() params: TradeAttachmentIdParamDto) {
    const data = await this.tradesService.deleteAttachment(params.id);
    return { data };
  }
}
