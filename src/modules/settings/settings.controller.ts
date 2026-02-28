import { Body, Controller, Get, Put, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, updateSettingsSchema } from './settings.schemas';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return { data };
  }

  @Put()
  @UsePipes(new ZodValidationPipe(updateSettingsSchema))
  async updateSettings(@Body() body: UpdateSettingsDto) {
    const data = await this.settingsService.updateSettings(body);
    return { data };
  }
}
