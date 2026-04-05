import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SearchQueryDto, searchQuerySchema } from './search.schemas';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search resources',
    description: 'Searches across supported resources using a free-text query.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search keyword.',
    example: 'BTC breakout',
  })
  @ApiOkResponse({
    description: 'Search results retrieved successfully.',
    schema: { example: { data: [] } },
  })
  @ApiBadRequestResponse({ description: 'Query parameters are invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(searchQuerySchema))
  async search(@Query() query: SearchQueryDto) {
    const data = await this.searchService.search(query.q);
    return { data };
  }
}
