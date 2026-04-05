import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Request as ExpressRequest, Response } from 'express';
import { hasMultipartFile } from '@common/utils/has-multipart-file.util';
import { env } from '../../common/config/env';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { ExportQueryDto, exportQuerySchema } from './import-export.schemas';
import { ImportExportService } from './import-export.service';
import {
  CurrentUser,
  type RequestUser,
} from '@common/auth/current-user.decorator';

@ApiTags('Import Export')
@ApiBearerAuth()
@Controller()
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}
  private getCurrentUserId(user: RequestUser | undefined): string {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }
    return user.id;
  }

  @Post('import/trades')
  @ApiOperation({
    summary: 'Import trades from CSV',
    description: 'Imports trade records from a multipart CSV file upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Trades imported successfully.',
    schema: {
      example: {
        data: {
          imported_count: 12,
          errors: [],
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Multipart upload is invalid or file content is malformed.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async importTrades(
    @Req() req: ExpressRequest,
    @CurrentUser() user: RequestUser | undefined,
  ) {
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
    const data = await this.importExportService.importTradesCsv(
      content,
      this.getCurrentUserId(user),
    );
    return { data };
  }

  @Get('export/trades.csv')
  @ApiOperation({
    summary: 'Export trades to CSV',
    description: 'Exports trade records as a CSV file.',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Optional start date-time filter in ISO 8601 format.',
    example: '2026-04-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'Optional end date-time filter in ISO 8601 format.',
    example: '2026-04-05T23:59:59.999Z',
  })
  @ApiOkResponse({
    description: 'CSV export generated successfully.',
    schema: {
      type: 'string',
      example:
        'id,account_id,instrument_id,type,direction,entry_datetime\n123,...',
    },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(exportQuerySchema))
  async exportTrades(
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) reply: FastifyReply,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const csv = await this.importExportService.exportTradesCsv({
      userId: this.getCurrentUserId(user),
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="trades.csv"');
    return csv;
  }

  @Get('export/journals.csv')
  @ApiOperation({
    summary: 'Export journals to CSV',
    description: 'Exports daily journal records as a CSV file.',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Optional start date-time filter in ISO 8601 format.',
    example: '2026-04-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'Optional end date-time filter in ISO 8601 format.',
    example: '2026-04-05T23:59:59.999Z',
  })
  @ApiOkResponse({
    description: 'CSV export generated successfully.',
    schema: {
      type: 'string',
      example: 'id,date,account_id,mood,energy,focus,confidence\n123,...',
    },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(exportQuerySchema))
  async exportJournals(
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) reply: FastifyReply,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const csv = await this.importExportService.exportJournalsCsv({
      userId: this.getCurrentUserId(user),
      dateFrom: query.date_from,
      dateTo: query.date_to,
    });
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="journals.csv"');
    return csv;
  }
}
