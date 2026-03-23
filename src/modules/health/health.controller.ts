import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '@common/auth/public.decorator';
import { HealthStatusEnum } from '@common/enums/health-status.enum';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Public()
  @Get()
  health() {
    this.logger.debug('Health check requested');

    return { status: HealthStatusEnum.OK };
  }
}
