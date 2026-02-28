import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ImportExportService } from './import-export.service';

@Controller()
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('import/trades')
  async importTrades(@Req() req: FastifyRequest) {
    const filePart = await (
      req as FastifyRequest & { file?: () => Promise<any> }
    ).file?.();
    if (!filePart) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Missing CSV file',
      });
    }
    const buffer = await filePart.toBuffer();
    const content = buffer.toString('utf8');
    const data = await this.importExportService.importTradesCsv(content);
    return { data };
  }

  @Get('export/trades.csv')
  async exportTrades(
    @Query() query: { date_from?: string; date_to?: string },
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
  async exportJournals(
    @Query() query: { date_from?: string; date_to?: string },
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
