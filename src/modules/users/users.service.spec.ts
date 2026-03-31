import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AppRolesService } from '@common/services/app-roles.service';
import type { DB } from '@db/client';
import { UsersService, type UserProfile } from './users.service';

interface DeleteQueryMock {
  where: jest.Mock<Promise<void>, [unknown]>;
}

interface InsertConflictQueryMock {
  onConflictDoNothing: jest.Mock<Promise<void>, []>;
}

interface InsertQueryMock {
  values: jest.Mock<InsertConflictQueryMock, [unknown]>;
}

interface DbMock {
  delete: jest.Mock<DeleteQueryMock, [unknown]>;
  insert: jest.Mock<InsertQueryMock, [unknown]>;
}

describe('UsersService', () => {
  let service: UsersService;
  let dbMock: DbMock;
  const appRolesServiceMock: Pick<AppRolesService, 'getRoleIdsByNames'> = {
    getRoleIdsByNames: jest.fn(),
  };

  beforeEach(async () => {
    dbMock = {
      delete: jest.fn(),
      insert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useFactory: () =>
            new UsersService(
              dbMock as unknown as DB,
              appRolesServiceMock as AppRolesService,
            ),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('throws bad request when assignRoles receives an empty roles array', async () => {
    await expect(service.assignRoles('user-id', [])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws not found when assignRoles target user does not exist', async () => {
    jest.spyOn(service, 'findProfileById').mockResolvedValueOnce(null);

    await expect(
      service.assignRoles('missing-user-id', ['ADMIN']),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('replaces user roles and returns updated user profile', async () => {
    const initialUser: UserProfile = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      googleId: null,
      isActive: true,
      roles: ['USER'],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const updatedUser: UserProfile = {
      ...initialUser,
      roles: ['ADMIN', 'USER'],
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    const deleteWhereMock: jest.Mock<Promise<void>, [unknown]> = jest
      .fn<Promise<void>, [unknown]>()
      .mockResolvedValue(undefined);
    const insertOnConflictMock: jest.Mock<Promise<void>, []> = jest
      .fn<Promise<void>, []>()
      .mockResolvedValue(undefined);
    const insertValuesMock: jest.Mock<InsertConflictQueryMock, [unknown]> = jest
      .fn<InsertConflictQueryMock, [unknown]>()
      .mockReturnValue({
        onConflictDoNothing: insertOnConflictMock,
      });

    dbMock.delete.mockReturnValue({
      where: deleteWhereMock,
    });
    dbMock.insert.mockReturnValue({
      values: insertValuesMock,
    });
    (appRolesServiceMock.getRoleIdsByNames as jest.Mock).mockResolvedValueOnce([
      'role-id-admin',
      'role-id-user',
    ]);
    jest
      .spyOn(service, 'findProfileById')
      .mockResolvedValueOnce(initialUser)
      .mockResolvedValueOnce(updatedUser);

    const actual = await service.assignRoles('user-id-1', [
      'ADMIN',
      'USER',
      'ADMIN',
    ]);

    expect(appRolesServiceMock.getRoleIdsByNames).toHaveBeenCalledWith([
      'ADMIN',
      'USER',
    ]);
    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
    expect(insertValuesMock).toHaveBeenCalledTimes(1);
    expect(insertOnConflictMock).toHaveBeenCalledTimes(1);
    expect(actual).toEqual(updatedUser);
  });
});
