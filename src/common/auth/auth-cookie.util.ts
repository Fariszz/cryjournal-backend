import type { CookieOptions, Response } from 'express';
import { env } from '@common/config/env';
import { getAuthSessionTtlSeconds } from '@common/auth/auth-session.constants';

export const ACCESS_TOKEN_COOKIE = 'access_token';

function getAuthCookieBaseOptions(): CookieOptions {
  const baseOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };
  if (env.COOKIE_DOMAIN === undefined) {
    return baseOptions;
  }
  return {
    ...baseOptions,
    domain: env.COOKIE_DOMAIN,
  };
}

/**
 * Builds httpOnly cookie options for the access token cookie.
 */
export function getAuthCookieOptions(rememberMe = false): CookieOptions {
  return {
    ...getAuthCookieBaseOptions(),
    maxAge: getAuthSessionTtlSeconds(rememberMe) * 1000,
  };
}

/**
 * Sets the access token httpOnly cookie on the response.
 */
export function setAuthCookie(
  res: Response,
  accessToken: string,
  rememberMe = false,
): void {
  res.cookie(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    getAuthCookieOptions(rememberMe),
  );
}

/**
 * Clears the access token httpOnly cookie from the response.
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, getAuthCookieBaseOptions());
}
