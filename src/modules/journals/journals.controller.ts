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
  journalCreateSchema,
  journalListQuerySchema,
  journalUpdateSchema,
} from './journals.schemas';
import { JournalsService } from './journals.service';

@Controller()
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Get('daily-journals')
  @UsePipes(new ZodValidationPipe(journalListQuerySchema))
  async list(
    @Query()
    query: {
      date_from?: string;
      date_to?: string;
      account_id?: string;
      page: number;
      page_size: number;
    },
  ) {
    const data = await this.journalsService.list({
      dateFrom: query.date_from,
      dateTo: query.date_to,
      accountId: query.account_id,
      page: query.page,
      pageSize: query.page_size,
    });
    return { data: data.rows, meta: data.meta };
  }

  @Post('daily-journals')
  @UsePipes(new ZodValidationPipe(journalCreateSchema))
  async create(@Body() body: unknown) {
    const data = await this.journalsService.create(body as never);
    return { data };
  }

  @Get('daily-journals/:id')
  async get(@Param('id') id: string) {
    const data = await this.journalsService.getById(id);
    return { data };
  }

  @Put('daily-journals/:id')
  @UsePipes(new ZodValidationPipe(journalUpdateSchema))
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = await this.journalsService.update(id, body as never);
    return { data };
  }

  @Post('daily-journal-attachments')
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
    const journalId = String(filePart.fields?.journal_id?.value ?? '');
    if (!journalId) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'journal_id is required',
      });
    }
    const caption = filePart.fields?.caption?.value
      ? String(filePart.fields.caption.value)
      : undefined;
    const data = await this.journalsService.addAttachment(
      journalId,
      {
        filename: filePart.filename,
        mimetype: filePart.mimetype,
        data: buffer,
      },
      caption,
    );
    return { data };
  }

  @Delete('daily-journal-attachments/:id')
  async deleteAttachment(@Param('id') id: string) {
    const data = await this.journalsService.deleteAttachment(id);
    return { data };
  }
}
