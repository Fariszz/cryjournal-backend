const SECONDS_PER_DAY = 24 * 60 * 60;

export const AUTH_SESSION_TTL_SECONDS = SECONDS_PER_DAY;
export const AUTH_REMEMBER_ME_TTL_SECONDS = 30 * SECONDS_PER_DAY;

/**
 * Resolves auth session TTL in seconds based on remember-me preference.
 */
export function getAuthSessionTtlSeconds(rememberMe: boolean): number {
  return rememberMe ? AUTH_REMEMBER_ME_TTL_SECONDS : AUTH_SESSION_TTL_SECONDS;
}

/**
 * Reads remember-me preference from validated auth request body.
 */
export function resolveRememberMe(input: { rememberMe: boolean }): boolean {
  return input.rememberMe;
}
