export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export function parseCookieHeader(
  header: string | undefined,
): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (!rawKey) {
      return acc;
    }

    const rawValue = rest.join('=');
    try {
      acc[rawKey] = decodeURIComponent(rawValue);
    } catch {
      acc[rawKey] = rawValue;
    }
    return acc;
  }, {});
}
