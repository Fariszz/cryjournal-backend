import { Module } from '@nestjs/common';
import { AppRolesService } from '@common/services/app-roles.service';
import { AdminUsersController } from './admin-users.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, AppRolesService],
  exports: [UsersService],
})
export class UsersModule {}
