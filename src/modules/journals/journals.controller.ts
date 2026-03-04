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
import type { Multipart, MultipartFile } from '@fastify/multipart';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
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
    z.string().uuid(),
  ),
  caption: z.preprocess(
    (value) =>
      value === undefined || value === null || String(value).trim() === ''
        ? undefined
        : String(value),
    z.string().optional(),
  ),
});

function hasMultipartFile(
  req: FastifyRequest,
): req is FastifyRequest & { file: () => Promise<MultipartFile | undefined> } {
  return typeof (req as { file?: unknown }).file === 'function';
}

function readMultipartField(
  field: Multipart | Multipart[] | undefined,
): unknown {
  const value = Array.isArray(field) ? field[0] : field;
  if (!value || !('value' in value)) {
    return undefined;
  }
  return value.value;
}

@Controller()
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Get('daily-journals')
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
  @UsePipes(new ZodValidationPipe(journalCreateSchema))
  async create(@Body() body: JournalCreateDto) {
    const data = await this.journalsService.create(body);
    return { data };
  }

  @Get('daily-journals/:id')
  @UsePipes(new ZodValidationPipe(journalIdParamSchema))
  async get(@Param() params: JournalIdParamDto) {
    const data = await this.journalsService.getById(params.id);
    return { data };
  }

  @Put('daily-journals/:id')
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
  async uploadAttachment(@Req() req: FastifyRequest) {
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
  @UsePipes(new ZodValidationPipe(journalAttachmentIdParamSchema))
  async deleteAttachment(@Param() params: JournalAttachmentIdParamDto) {
    const data = await this.journalsService.deleteAttachment(params.id);
    return { data };
  }
}
