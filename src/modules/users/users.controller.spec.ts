import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { RequestUser } from '@common/auth/current-user.decorator';
import { UsersController } from './users.controller';
import { type UserProfile, UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock: Pick<UsersService, 'findProfileById'> = {
    findProfileById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('returns current user profile for an authenticated request', async () => {
    const requestUser: RequestUser = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      roles: ['USER'],
    };
    const profile: UserProfile = {
      id: requestUser.id,
      email: requestUser.email,
      name: requestUser.name,
      googleId: null,
      isActive: true,
      roles: requestUser.roles,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    (usersServiceMock.findProfileById as jest.Mock).mockResolvedValueOnce(
      profile,
    );

    const actual = await controller.me(requestUser);

    expect(usersServiceMock.findProfileById).toHaveBeenCalledWith('user-id-1');
    expect(actual).toEqual({ data: profile });
  });

  it('throws unauthorized when request has no user', async () => {
    await expect(controller.me(undefined)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws unauthorized when authenticated user does not exist anymore', async () => {
    const requestUser: RequestUser = {
      id: 'stale-user-id',
      email: 'stale@example.com',
      name: 'Stale User',
      roles: ['USER'],
    };
    (usersServiceMock.findProfileById as jest.Mock).mockResolvedValueOnce(null);

    await expect(controller.me(requestUser)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
