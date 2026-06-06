import { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { GoogleAuthGuard } from './google-auth.guard';

jest.mock('@common/config/env', () => ({
  env: {
    CORS_ALLOWED_ORIGINS:
      'http://localhost:5173,http://localhost:4173,https://app.example.com',
  },
}));

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;

  const createExecutionContext = (
    request: Partial<Request>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    guard = new GoogleAuthGuard();
  });

  it('getAuthenticateOptions passes validated redirectOrigin as OAuth state', () => {
    const context = createExecutionContext({
      path: '/api/v1/auth/google',
      query: {
        redirectOrigin: 'http://localhost:4173',
      },
    });

    const actualOptions = guard.getAuthenticateOptions(context);

    expect(actualOptions).toEqual({ state: 'http://localhost:4173' });
  });

  it('getAuthenticateOptions falls back to default origin when redirectOrigin is invalid', () => {
    const context = createExecutionContext({
      path: '/api/v1/auth/google',
      query: {
        redirectOrigin: 'https://evil.example.com',
      },
    });

    const actualOptions = guard.getAuthenticateOptions(context);

    expect(actualOptions).toEqual({ state: 'http://localhost:5173' });
  });

  it('getAuthenticateOptions returns empty options for callback route', () => {
    const context = createExecutionContext({
      path: '/api/v1/auth/google/callback',
      query: {
        state: 'http://localhost:4173',
      },
    });

    const actualOptions = guard.getAuthenticateOptions(context);

    expect(actualOptions).toEqual({});
  });
});
