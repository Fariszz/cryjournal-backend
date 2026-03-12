import { Controller, Get } from '@nestjs/common';
import { Public } from '@common/auth/public.decorator';
import { HealthStatusEnum } from '@common/enums/health-status.enum';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return { status: HealthStatusEnum.OK };
  }
}
