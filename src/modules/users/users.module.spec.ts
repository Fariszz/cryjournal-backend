import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesService } from '@common/services/app-roles.service';
import { AdminUsersController } from './admin-users.controller';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersModule', () => {
  it('compiles and resolves module wiring for users controllers and providers', async () => {
    const usersServiceMock = {
      findProfileById: jest.fn(),
      listUsers: jest.fn(),
      assignRoles: jest.fn(),
      setActive: jest.fn(),
    };
    const appRolesServiceMock = {
      getRoleIdByName: jest.fn(),
      getRoleIdsByNames: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .overrideProvider(AppRolesService)
      .useValue(appRolesServiceMock)
      .compile();

    const usersController = module.get<UsersController>(UsersController);
    const adminUsersController = module.get<AdminUsersController>(
      AdminUsersController,
    );
    const usersService = module.get<UsersService>(UsersService);
    const appRolesService = module.get<AppRolesService>(AppRolesService);

    expect(usersController).toBeDefined();
    expect(adminUsersController).toBeDefined();
    expect(usersService).toBe(usersServiceMock);
    expect(appRolesService).toBe(appRolesServiceMock);
  });
});
