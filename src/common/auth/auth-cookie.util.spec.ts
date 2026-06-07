import type { Response } from 'express';
import {
  AUTH_REMEMBER_ME_TTL_SECONDS,
  AUTH_SESSION_TTL_SECONDS,
} from './auth-session.constants';
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookie,
  getAuthCookieOptions,
  setAuthCookie,
} from './auth-cookie.util';

jest.mock('@common/config/env', () => ({
  env: {
    NODE_ENV: 'development',
    COOKIE_DOMAIN: undefined,
  },
}));

describe('auth-cookie.util', () => {
  const createResponseMock = (): {
    response: Response;
    cookieMock: jest.Mock;
    clearCookieMock: jest.Mock;
  } => {
    const cookieMock = jest.fn();
    const clearCookieMock = jest.fn();
    return {
      response: {
        cookie: cookieMock,
        clearCookie: clearCookieMock,
      } as unknown as Response,
      cookieMock,
      clearCookieMock,
    };
  };

  it('getAuthCookieOptions returns httpOnly lax cookie for one day by default', () => {
    const actualOptions = getAuthCookieOptions();

    expect(actualOptions).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: AUTH_SESSION_TTL_SECONDS * 1000,
      path: '/',
    });
  });

  it('getAuthCookieOptions returns thirty day maxAge when rememberMe is true', () => {
    const actualOptions = getAuthCookieOptions(true);

    expect(actualOptions.maxAge).toBe(AUTH_REMEMBER_ME_TTL_SECONDS * 1000);
  });

  it('setAuthCookie sets access token cookie on response', () => {
    const { response, cookieMock } = createResponseMock();

    setAuthCookie(response, 'jwt-token', true);

    expect(cookieMock).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      'jwt-token',
      getAuthCookieOptions(true),
    );
  });

  it('clearAuthCookie clears access token cookie from response', () => {
    const { response, clearCookieMock } = createResponseMock();

    clearAuthCookie(response);

    expect(clearCookieMock).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
