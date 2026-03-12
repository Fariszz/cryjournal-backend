import { Module } from '@nestjs/common';
import { AppRolesService } from '@common/services/app-roles.service';
import { RolesService } from './roles.service';

@Module({
  providers: [RolesService, AppRolesService],
  exports: [RolesService],
})
export class RolesModule {}
