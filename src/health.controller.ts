import { Controller, Get } from '@nestjs/common';
import { Public } from './common/auth/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
