import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
import type { Request as ExpressRequest, Response } from 'express';
import { z } from 'zod';
import { hasMultipartFile } from '@common/utils/has-multipart-file.util';
import { readMultipartField } from '@common/utils/read-multipart-field.util';
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

const tradeAttachmentFieldsSchema = z.object({
  trade_id: z.preprocess(
    (value) => (value === undefined || value === null ? '' : String(value)),
    z
      .string()
      .uuid()
      .describe('Trade identifier in UUID format for attachment upload.'),
  ),
  caption: z.preprocess(
    (value) =>
      value === undefined || value === null || String(value).trim() === ''
        ? undefined
        : String(value),
    z.string().optional().describe('Optional attachment caption text.'),
  ),
});

@ApiTags('Trades')
@ApiBearerAuth()
@Controller()
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post('trades')
  @ApiOperation({
    summary: 'Create trade',
    description: 'Creates a new trade record.',
  })
  @ApiBody({ type: TradeCreateDto, description: 'Payload to create a trade.' })
  @ApiCreatedResponse({
    description: 'Trade created successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(tradeCreateSchema))
  async create(@Body() body: TradeCreateDto) {
    const data = await this.tradesService.create(body);
    return { data };
  }

  @Put('trades/:id')
  @ApiOperation({
    summary: 'Update trade',
    description: 'Updates trade fields by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trade identifier.',
    example: '72e52434-a5df-4859-a563-09af31a89b8c',
  })
  @ApiBody({
    type: TradeUpdateDto,
    description: 'Payload to update trade fields.',
  })
  @ApiOkResponse({
    description: 'Trade updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Trade was not found.' })
  @UsePipes(
    new ZodValidationPipe(tradeIdParamSchema),
    new ZodValidationPipe(tradeUpdateSchema),
  )
  async update(@Param() params: TradeIdParamDto, @Body() body: TradeUpdateDto) {
    const data = await this.tradesService.update(params.id, body);
    return { data };
  }

  @Get('trades')
  @ApiOperation({
    summary: 'List trades',
    description: 'Retrieves paginated trades using optional filters.',
  })
  @ApiQuery({
    name: 'account_id',
    required: false,
    description: 'Filter by account ID.',
  })
  @ApiQuery({
    name: 'instrument_id',
    required: false,
    description: 'Filter by instrument ID.',
  })
  @ApiQuery({
    name: 'strategy_id',
    required: false,
    description: 'Filter by strategy ID.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by trade type.',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Filter start date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'Filter end date-time in ISO 8601 format.',
  })
  @ApiQuery({
    name: 'session',
    required: false,
    description: 'Filter by trading session.',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated tag identifiers.',
  })
  @ApiQuery({
    name: 'demons',
    required: false,
    description: 'Comma-separated demon identifiers.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number.',
    example: 1,
  })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: 'Number of items per page.',
    example: 20,
  })
  @ApiOkResponse({
    description: 'Trades retrieved successfully.',
    schema: {
      example: {
        data: [],
        meta: { page: 1, page_size: 20, total_items: 0, total_pages: 0 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
  @ApiOperation({
    summary: 'Get trade by ID',
    description: 'Retrieves a trade by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trade identifier.',
    example: '72e52434-a5df-4859-a563-09af31a89b8c',
  })
  @ApiOkResponse({
    description: 'Trade retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Trade was not found.' })
  @UsePipes(new ZodValidationPipe(tradeIdParamSchema))
  async get(@Param() params: TradeIdParamDto) {
    const data = await this.tradesService.getById(params.id);
    return { data };
  }

  @Post('trades/bulk')
  @ApiOperation({
    summary: 'Bulk update trades',
    description: 'Applies bulk updates to multiple trades.',
  })
  @ApiBody({
    type: TradeBulkDto,
    description: 'Payload for bulk trade updates.',
  })
  @ApiCreatedResponse({
    description: 'Trades updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(tradeBulkSchema))
  async bulk(@Body() body: TradeBulkDto) {
    const data = await this.tradesService.bulkUpdate(body);
    return { data };
  }

  @Post('trade-attachments')
  @ApiOperation({
    summary: 'Upload trade attachment',
    description: 'Uploads a multipart attachment and links it to a trade.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Attachment uploaded successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Multipart upload or form fields are invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async uploadAttachment(@Req() req: ExpressRequest) {
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

    const parsedFields = tradeAttachmentFieldsSchema.safeParse({
      trade_id: readMultipartField(filePart.fields.trade_id),
      caption: readMultipartField(filePart.fields.caption),
    });
    if (!parsedFields.success) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: parsedFields.error.issues
          .map((issue) => issue.message)
          .join(', '),
      });
    }

    const data = await this.tradesService.addAttachment(
      parsedFields.data.trade_id,
      {
        filename: filePart.filename,
        mimetype: filePart.mimetype,
        data: buffer,
      },
      parsedFields.data.caption,
    );
    return { data };
  }

  @Delete('trade-attachments/:id')
  @ApiOperation({
    summary: 'Delete trade attachment',
    description: 'Removes a trade attachment by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trade attachment identifier.',
    example: '8f4bca66-18d4-4ceb-92a4-c9af5a4e5d4e',
  })
  @ApiOkResponse({
    description: 'Attachment deleted successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Attachment was not found.' })
  @UsePipes(new ZodValidationPipe(tradeAttachmentIdParamSchema))
  async deleteAttachment(@Param() params: TradeAttachmentIdParamDto) {
    const data = await this.tradesService.deleteAttachment(params.id);
    return { data };
  }
}
