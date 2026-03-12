import { Injectable } from '@nestjs/common';
import type { AppRole } from '@common/constants/app-role.constants';
import { AppRolesService } from '@common/services/app-roles.service';

@Injectable()
export class RolesService {
  constructor(private readonly appRolesService: AppRolesService) {}

  async getRoleIdByName(roleName: AppRole): Promise<string> {
    return this.appRolesService.getRoleIdByName(roleName);
  }

  async getRoleIdsByNames(roleNames: readonly AppRole[]): Promise<string[]> {
    return this.appRolesService.getRoleIdsByNames(roleNames);
  }
}
