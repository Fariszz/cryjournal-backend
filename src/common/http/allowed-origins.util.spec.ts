import {
  buildOAuthErrorRedirectUrl,
  getCorsAllowedOrigins,
  getDefaultOAuthRedirectOrigin,
  getExplicitAllowedOrigins,
  parseAllowedOrigins,
  resolveOAuthRedirectOrigin,
} from './allowed-origins.util';

describe('allowed-origins.util', () => {
  const inputAllowedOrigins =
    'http://localhost:5173, http://localhost:4173, https://app.example.com';

  it('parseAllowedOrigins trims and filters empty values', () => {
    const actualOrigins = parseAllowedOrigins(
      ' http://localhost:5173 , ,http://localhost:4173 ',
    );

    expect(actualOrigins).toEqual([
      'http://localhost:5173',
      'http://localhost:4173',
    ]);
  });

  it('getExplicitAllowedOrigins excludes wildcard origins', () => {
    const actualOrigins = getExplicitAllowedOrigins(
      '*,http://localhost:5173,http://localhost:4173',
    );

    expect(actualOrigins).toEqual([
      'http://localhost:5173',
      'http://localhost:4173',
    ]);
  });

  it('getCorsAllowedOrigins returns wildcard when configured', () => {
    const actualOrigins = getCorsAllowedOrigins('*,http://localhost:5173');

    expect(actualOrigins).toBe('*');
  });

  it('getCorsAllowedOrigins returns explicit origins when wildcard is absent', () => {
    const actualOrigins = getCorsAllowedOrigins(inputAllowedOrigins);

    expect(actualOrigins).toEqual([
      'http://localhost:5173',
      'http://localhost:4173',
      'https://app.example.com',
    ]);
  });

  it('getDefaultOAuthRedirectOrigin returns the first explicit origin', () => {
    const actualOrigin = getDefaultOAuthRedirectOrigin(inputAllowedOrigins);

    expect(actualOrigin).toBe('http://localhost:5173');
  });

  it('getDefaultOAuthRedirectOrigin throws when only wildcard is configured', () => {
    expect(() => getDefaultOAuthRedirectOrigin('*')).toThrow(
      'CORS_ALLOWED_ORIGINS must include at least one explicit origin for OAuth redirects',
    );
  });

  it('resolveOAuthRedirectOrigin returns requested origin when allowed', () => {
    const actualOrigin = resolveOAuthRedirectOrigin(
      'http://localhost:4173',
      inputAllowedOrigins,
    );

    expect(actualOrigin).toBe('http://localhost:4173');
  });

  it('resolveOAuthRedirectOrigin falls back to default when origin is missing', () => {
    const actualOrigin = resolveOAuthRedirectOrigin(
      undefined,
      inputAllowedOrigins,
    );

    expect(actualOrigin).toBe('http://localhost:5173');
  });

  it('resolveOAuthRedirectOrigin falls back to default when origin is not allowed', () => {
    const actualOrigin = resolveOAuthRedirectOrigin(
      'https://evil.example.com',
      inputAllowedOrigins,
    );

    expect(actualOrigin).toBe('http://localhost:5173');
  });

  it('buildOAuthErrorRedirectUrl appends auth error query parameter', () => {
    const actualUrl = buildOAuthErrorRedirectUrl('http://localhost:5173');

    expect(actualUrl).toBe('http://localhost:5173/?error=auth');
  });
});
