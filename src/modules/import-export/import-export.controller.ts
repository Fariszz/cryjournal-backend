import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { hasMultipartFile } from '@common/utils/has-multipart-file.util';
import { env } from '../../common/config/env';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { ExportQueryDto, exportQuerySchema } from './import-export.schemas';
import { ImportExportService } from './import-export.service';

@Controller()
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('import/trades')
  async importTrades(@Req() req: FastifyRequest) {
    if (!hasMultipartFile(req)) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Multipart file upload is not available',
      });
    }

    const filePart = await req.file();
    if (!filePart) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Missing CSV file',
      });
    }

    const buffer = await filePart.toBuffer();
    if (buffer.length > env.MAX_UPLOAD_BYTES) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'File too large',
      });
    }

    const content = buffer.toString('utf8');
    const data = await this.importExportService.importTradesCsv(content);
    return { data };
  }

  @Get('export/trades.csv')
  @UsePipes(new ZodValidationPipe(exportQuerySchema))
  async exportTrades(
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const csv = await this.importExportService.exportTradesCsv({
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="trades.csv"');
    return csv;
  }

  @Get('export/journals.csv')
  @UsePipes(new ZodValidationPipe(exportQuerySchema))
  async exportJournals(
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const csv = await this.importExportService.exportJournalsCsv({
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="journals.csv"');
    return csv;
  }
}
