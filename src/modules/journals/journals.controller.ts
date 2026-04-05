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
// import type { FastifyRequest } from 'fastify';
import type { Request as ExpressRequest, Response } from 'express';
import { z } from 'zod';
import { hasMultipartFile } from '@common/utils/has-multipart-file.util';
import { readMultipartField } from '@common/utils/read-multipart-field.util';
import { env } from '../../common/config/env';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  JournalAttachmentIdParamDto,
  journalAttachmentIdParamSchema,
  JournalCreateDto,
  journalCreateSchema,
  JournalIdParamDto,
  journalIdParamSchema,
  JournalListQueryDto,
  journalListQuerySchema,
  JournalUpdateDto,
  journalUpdateSchema,
} from './journals.schemas';
import { JournalsService } from './journals.service';

const journalAttachmentFieldsSchema = z.object({
  journal_id: z.preprocess(
    (value) => (value === undefined || value === null ? '' : String(value)),
    z
      .string()
      .uuid()
      .describe(
        'Daily journal identifier in UUID format for attachment upload.',
      ),
  ),
  caption: z.preprocess(
    (value) =>
      value === undefined || value === null || String(value).trim() === ''
        ? undefined
        : String(value),
    z.string().optional().describe('Optional attachment caption text.'),
  ),
});

@ApiTags('Journals')
@ApiBearerAuth()
@Controller()
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Get('daily-journals')
  @ApiOperation({
    summary: 'List daily journals',
    description: 'Retrieves paginated daily journals with optional filters.',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Optional start date filter (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'Optional end date filter (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'account_id',
    required: false,
    description: 'Optional account identifier filter.',
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
    description: 'Journals retrieved successfully.',
    schema: {
      example: {
        data: [],
        meta: { page: 1, page_size: 20, total_items: 0, total_pages: 0 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(journalListQuerySchema))
  async list(
    @Query()
    query: JournalListQueryDto,
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
  @ApiOperation({
    summary: 'Create daily journal',
    description: 'Creates a new daily journal entry.',
  })
  @ApiBody({
    type: JournalCreateDto,
    description: 'Payload to create a daily journal.',
  })
  @ApiCreatedResponse({
    description: 'Daily journal created successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(journalCreateSchema))
  async create(@Body() body: JournalCreateDto) {
    const data = await this.journalsService.create(body);
    return { data };
  }

  @Get('daily-journals/:id')
  @ApiOperation({
    summary: 'Get daily journal by ID',
    description: 'Retrieves a daily journal entry by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Daily journal identifier.',
    example: '659a15a6-6d20-4ac4-9e56-12fffdadcfca',
  })
  @ApiOkResponse({
    description: 'Daily journal retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Daily journal was not found.' })
  @UsePipes(new ZodValidationPipe(journalIdParamSchema))
  async get(@Param() params: JournalIdParamDto) {
    const data = await this.journalsService.getById(params.id);
    return { data };
  }

  @Put('daily-journals/:id')
  @ApiOperation({
    summary: 'Update daily journal',
    description: 'Updates daily journal fields by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Daily journal identifier.',
    example: '659a15a6-6d20-4ac4-9e56-12fffdadcfca',
  })
  @ApiBody({
    type: JournalUpdateDto,
    description: 'Payload to update daily journal fields.',
  })
  @ApiOkResponse({
    description: 'Daily journal updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({
    description: 'Path parameter or payload is invalid.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Daily journal was not found.' })
  @UsePipes(
    new ZodValidationPipe(journalIdParamSchema),
    new ZodValidationPipe(journalUpdateSchema),
  )
  async update(
    @Param() params: JournalIdParamDto,
    @Body() body: JournalUpdateDto,
  ) {
    const data = await this.journalsService.update(params.id, body);
    return { data };
  }

  @Post('daily-journal-attachments')
  @ApiOperation({
    summary: 'Upload daily journal attachment',
    description:
      'Uploads a multipart attachment and links it to a daily journal.',
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

    const parsedFields = journalAttachmentFieldsSchema.safeParse({
      journal_id: readMultipartField(filePart.fields.journal_id),
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

    const data = await this.journalsService.addAttachment(
      parsedFields.data.journal_id,
      {
        filename: filePart.filename,
        mimetype: filePart.mimetype,
        data: buffer,
      },
      parsedFields.data.caption,
    );
    return { data };
  }

  @Delete('daily-journal-attachments/:id')
  @ApiOperation({
    summary: 'Delete daily journal attachment',
    description: 'Removes a daily journal attachment by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Daily journal attachment identifier.',
    example: 'd71f38d6-3d03-4ac5-a664-bff4f53c0f49',
  })
  @ApiOkResponse({
    description: 'Attachment deleted successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Path parameter is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Attachment was not found.' })
  @UsePipes(new ZodValidationPipe(journalAttachmentIdParamSchema))
  async deleteAttachment(@Param() params: JournalAttachmentIdParamDto) {
    const data = await this.journalsService.deleteAttachment(params.id);
    return { data };
  }
}
