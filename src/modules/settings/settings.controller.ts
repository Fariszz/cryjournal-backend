import { Body, Controller, Get, Put, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, updateSettingsSchema } from './settings.schemas';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get application settings',
    description: 'Retrieves current user application settings.',
  })
  @ApiOkResponse({
    description: 'Settings retrieved successfully.',
    schema: { example: { data: {} } },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return { data };
  }

  @Put()
  @ApiOperation({
    summary: 'Update application settings',
    description: 'Updates current user application settings.',
  })
  @ApiBody({
    type: UpdateSettingsDto,
    description: 'Payload to update application settings.',
  })
  @ApiOkResponse({
    description: 'Settings updated successfully.',
    schema: { example: { data: {} } },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UsePipes(new ZodValidationPipe(updateSettingsSchema))
  async updateSettings(@Body() body: UpdateSettingsDto) {
    const data = await this.settingsService.updateSettings(body);
    return { data };
  }
}
