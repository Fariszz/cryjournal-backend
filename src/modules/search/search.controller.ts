import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { SearchQueryDto, searchQuerySchema } from './search.schemas';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(searchQuerySchema))
  async search(@Query() query: SearchQueryDto) {
    const data = await this.searchService.search(query.q);
    return { data };
  }
}
