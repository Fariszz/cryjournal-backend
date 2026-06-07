import { ExecutionContext } from '@nestjs/common';
import { OptionalAuthGuard } from './optional-auth.guard';

describe('OptionalAuthGuard', () => {
  let guard: OptionalAuthGuard;

  beforeEach(() => {
    guard = new OptionalAuthGuard();
    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createExecutionContext = (
    request: Record<string, unknown>,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('allows request without authorization header or auth cookie', () => {
    const context = createExecutionContext({ headers: {} });

    const actual = guard.canActivate(context);

    expect(actual).toBe(true);
  });

  it('delegates to jwt guard when auth cookie is present', () => {
    const context = createExecutionContext({
      headers: {},
      cookies: { access_token: 'jwt-token' },
    });

    const actual = guard.canActivate(context);

    expect(actual).toBe(true);
  });

  it('delegates to jwt guard when authorization header is present', () => {
    const context = createExecutionContext({
      headers: { authorization: 'Bearer jwt-token' },
    });

    const actual = guard.canActivate(context);

    expect(actual).toBe(true);
  });
});
