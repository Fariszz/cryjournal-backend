/**
 * Parses a comma-separated list of allowed origins.
 */
export function parseAllowedOrigins(raw: string): readonly string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Returns explicit origins, excluding the CORS wildcard.
 */
export function getExplicitAllowedOrigins(raw: string): readonly string[] {
  return parseAllowedOrigins(raw).filter((origin) => origin !== '*');
}

/**
 * Resolves the origin setting used by Nest CORS configuration.
 */
export function getCorsAllowedOrigins(raw: string): string | string[] {
  const origins = parseAllowedOrigins(raw);
  if (origins.includes('*')) {
    return '*';
  }
  return [...origins];
}

/**
 * Returns the default OAuth redirect origin from the configured allowlist.
 */
export function getDefaultOAuthRedirectOrigin(raw: string): string {
  const explicitOrigins = getExplicitAllowedOrigins(raw);
  const firstOrigin = explicitOrigins[0];
  if (!firstOrigin) {
    throw new Error(
      'CORS_ALLOWED_ORIGINS must include at least one explicit origin for OAuth redirects',
    );
  }
  return firstOrigin;
}

/**
 * Resolves a safe OAuth redirect origin against the configured allowlist.
 */
export function resolveOAuthRedirectOrigin(
  requestedOrigin: string | undefined,
  allowedOriginsRaw: string,
): string {
  const defaultOrigin = getDefaultOAuthRedirectOrigin(allowedOriginsRaw);
  if (!requestedOrigin) {
    return defaultOrigin;
  }
  const normalizedRequested = requestedOrigin.trim();
  if (!normalizedRequested) {
    return defaultOrigin;
  }
  const explicitOrigins = getExplicitAllowedOrigins(allowedOriginsRaw);
  if (explicitOrigins.includes(normalizedRequested)) {
    return normalizedRequested;
  }
  return defaultOrigin;
}

/**
 * Builds an OAuth error redirect URL for the given frontend origin.
 */
export function buildOAuthErrorRedirectUrl(origin: string): string {
  const redirectUrl = new URL(origin);
  redirectUrl.searchParams.set('error', 'auth');
  return redirectUrl.toString();
}
