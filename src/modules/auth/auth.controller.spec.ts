import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request as ExpressRequest, Response } from 'express';
import type { RequestUser } from '@common/auth/current-user.decorator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('@common/config/env', () => ({
  env: {
    CORS_ALLOWED_ORIGINS:
      'http://localhost:5173,http://localhost:4173,https://app.example.com',
    NODE_ENV: 'development',
    JWT_EXPIRES_IN: 3600,
  },
}));

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock: Pick<
    AuthService,
    'register' | 'login' | 'logout' | 'getMe'
  > = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
  };

  const createResponseMock = (): {
    response: Response;
    cookieMock: jest.Mock;
    clearCookieMock: jest.Mock;
    redirectMock: jest.Mock;
  } => {
    const cookieMock = jest.fn();
    const clearCookieMock = jest.fn();
    const redirectMock = jest.fn();
    return {
      response: {
        cookie: cookieMock,
        clearCookie: clearCookieMock,
        redirect: redirectMock,
      } as unknown as Response,
      cookieMock,
      clearCookieMock,
      redirectMock,
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register sets auth cookie and returns auth payload', async () => {
    const { response, cookieMock } = createResponseMock();
    const expectedAuthResponse = {
      accessToken: 'jwt-token',
      expiresIn: 86400,
      user: {
        id: 'user-id-1',
        email: 'user@example.com',
        name: 'User Name',
        roles: ['USER'],
      },
    };
    (authServiceMock.register as jest.Mock).mockResolvedValue(
      expectedAuthResponse,
    );

    const actual = await controller.register(
      {
        email: 'user@example.com',
        password: 'Passw0rd!',
        name: 'User Name',
        rememberMe: true,
      },
      response,
    );

    expect(actual).toEqual({ data: expectedAuthResponse });
    expect(cookieMock).toHaveBeenCalledWith(
      'access_token',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 2592000000,
      }),
    );
  });

  it('login sets auth cookie and returns auth payload', async () => {
    const { response, cookieMock } = createResponseMock();
    const inputUser: RequestUser = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      roles: ['USER'],
    };
    const expectedAuthResponse = {
      accessToken: 'jwt-token',
      expiresIn: 86400,
      user: inputUser,
    };
    (authServiceMock.login as jest.Mock).mockResolvedValue(
      expectedAuthResponse,
    );

    const actual = await controller.login(
      inputUser,
      {
        email: 'user@example.com',
        password: 'Passw0rd!',
        rememberMe: false,
      },
      response,
    );

    expect(actual).toEqual({ data: expectedAuthResponse });
    expect(authServiceMock.login).toHaveBeenCalledWith(
      {
        id: 'user-id-1',
        email: 'user@example.com',
        name: 'User Name',
        roles: ['USER'],
        isActive: true,
      },
      false,
    );
    expect(cookieMock).toHaveBeenCalledWith(
      'access_token',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 86400000,
      }),
    );
  });

  it('logout clears auth cookie and returns success payload', async () => {
    const { response, clearCookieMock } = createResponseMock();
    const inputUser: RequestUser = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      roles: ['USER'],
    };
    (authServiceMock.logout as jest.Mock).mockResolvedValue(undefined);

    const actual = await controller.logout(inputUser, response);

    expect(actual).toEqual({ data: { success: true } });
    expect(authServiceMock.logout).toHaveBeenCalledWith('user-id-1');
    expect(clearCookieMock).toHaveBeenCalledWith(
      'access_token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('googleCallback redirects to default frontend when state is missing', async () => {
    const { response, cookieMock, redirectMock } = createResponseMock();
    const requestUser: RequestUser = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      roles: ['USER'],
    };
    (authServiceMock.login as jest.Mock).mockResolvedValue({
      accessToken: 'jwt-token',
      user: requestUser,
    });

    await controller.googleCallback(
      { user: requestUser } as ExpressRequest & { user?: RequestUser },
      response,
    );

    expect(cookieMock).toHaveBeenCalledWith(
      'access_token',
      'jwt-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(redirectMock).toHaveBeenCalledWith('http://localhost:5173');
  });

  it('googleCallback redirects to allowed origin from OAuth state', async () => {
    const { response, redirectMock } = createResponseMock();
    const requestUser: RequestUser = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      roles: ['USER'],
    };
    (authServiceMock.login as jest.Mock).mockResolvedValue({
      accessToken: 'jwt-token',
      user: requestUser,
    });

    await controller.googleCallback(
      {
        user: requestUser,
        query: { state: 'http://localhost:4173' },
      } as ExpressRequest & { user?: RequestUser },
      response,
    );

    expect(redirectMock).toHaveBeenCalledWith('http://localhost:4173');
  });

  it('googleCallback falls back to default origin when OAuth state is not allowed', async () => {
    const { response, redirectMock } = createResponseMock();
    const requestUser: RequestUser = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'User Name',
      roles: ['USER'],
    };
    (authServiceMock.login as jest.Mock).mockResolvedValue({
      accessToken: 'jwt-token',
      user: requestUser,
    });

    await controller.googleCallback(
      {
        user: requestUser,
        query: { state: 'https://evil.example.com' },
      } as ExpressRequest & { user?: RequestUser },
      response,
    );

    expect(redirectMock).toHaveBeenCalledWith('http://localhost:5173');
  });

  it('googleCallback redirects to default frontend with error when user is missing', async () => {
    const { response, redirectMock } = createResponseMock();

    await controller.googleCallback(
      {} as ExpressRequest & { user?: RequestUser },
      response,
    );

    expect(redirectMock).toHaveBeenCalledWith(
      'http://localhost:5173/?error=auth',
    );
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('googleCallback redirects to allowed origin with error when user is missing', async () => {
    const { response, redirectMock } = createResponseMock();

    await controller.googleCallback(
      {
        query: { state: 'http://localhost:4173' },
      } as ExpressRequest & { user?: RequestUser },
      response,
    );

    expect(redirectMock).toHaveBeenCalledWith(
      'http://localhost:4173/?error=auth',
    );
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('login throws when user is missing', async () => {
    const { response } = createResponseMock();

    await expect(
      controller.login(
        undefined,
        {
          email: 'user@example.com',
          password: 'Passw0rd!',
          rememberMe: false,
        },
        response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
