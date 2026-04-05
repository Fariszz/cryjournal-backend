import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '@common/auth/public.decorator';
import { HealthStatusEnum } from '@common/enums/health-status.enum';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Checks API availability and returns current health status.',
  })
  @ApiOkResponse({
    description: 'Service is healthy.',
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  health() {
    this.logger.debug('Health check requested');

    return { status: HealthStatusEnum.OK };
  }
}
