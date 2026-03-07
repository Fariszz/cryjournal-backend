import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestUser } from '@common/auth/current-user.decorator';
import { RolesGuard } from './roles.guard';

interface RequestWithUser {
  user?: RequestUser;
}

function createExecutionContext(request: RequestWithUser): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => class TestClass {},
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(reflectorMock);
    jest.clearAllMocks();
  });

  it('allows request when no roles are required', () => {
    jest
      .spyOn(reflectorMock, 'getAllAndOverride')
      .mockReturnValueOnce(undefined);

    const actual = guard.canActivate(createExecutionContext({}));

    expect(actual).toBe(true);
  });

  it('allows request when user has at least one required role', () => {
    jest
      .spyOn(reflectorMock, 'getAllAndOverride')
      .mockReturnValueOnce(['ADMIN']);

    const actual = guard.canActivate(
      createExecutionContext({
        user: {
          id: 'user-id',
          email: 'admin@example.com',
          name: 'Admin',
          roles: ['ADMIN'],
        },
      }),
    );

    expect(actual).toBe(true);
  });

  it('throws unauthorized when roles are required but user is missing', () => {
    jest
      .spyOn(reflectorMock, 'getAllAndOverride')
      .mockReturnValueOnce(['ADMIN']);

    expect(() => guard.canActivate(createExecutionContext({}))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws forbidden when user lacks required roles', () => {
    jest
      .spyOn(reflectorMock, 'getAllAndOverride')
      .mockReturnValueOnce(['ADMIN']);

    expect(() =>
      guard.canActivate(
        createExecutionContext({
          user: {
            id: 'user-id',
            email: 'user@example.com',
            name: 'User',
            roles: ['USER'],
          },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
