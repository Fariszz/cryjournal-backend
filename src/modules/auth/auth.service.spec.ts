import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@modules/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock: Pick<
    UsersService,
    'findByEmail' | 'createLocalUser'
  > = {
    findByEmail: jest.fn(),
    createLocalUser: jest.fn(),
  };

  const jwtServiceMock: Pick<JwtService, 'sign'> = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register returns JWT access token and user profile', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);
    (usersServiceMock.createLocalUser as jest.Mock).mockResolvedValue({
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      googleId: null,
      isActive: true,
      roles: ['USER'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (jwtServiceMock.sign as jest.Mock).mockReturnValue('jwt-token');

    const result = await service.register({
      email: 'user@example.com',
      password: 'Passw0rd!',
      name: 'User Name',
    });

    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'user-id-1',
        email: 'user@example.com',
        name: 'User Name',
        roles: ['USER'],
      },
    });
  });

  it('register throws conflict for an existing email', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      id: 'existing',
      email: 'user@example.com',
    });

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'Passw0rd!',
        name: 'User Name',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
