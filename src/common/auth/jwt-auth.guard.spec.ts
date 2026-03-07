import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(reflectorMock);
    jest.clearAllMocks();
  });

  it('returns user from handleRequest when authentication succeeds', () => {
    const expectedUser = { id: 'user-id' };

    const actual = guard.handleRequest(null, expectedUser);

    expect(actual).toEqual(expectedUser);
  });

  it('throws UnauthorizedException from handleRequest when user is missing', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });
});
