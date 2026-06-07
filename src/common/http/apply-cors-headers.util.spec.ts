import type { IncomingMessage, ServerResponse } from 'http';
import { applyCorsHeaders } from './apply-cors-headers.util';

jest.mock('@common/config/env', () => ({
  env: {
    CORS_ALLOWED_ORIGINS: 'http://localhost:5173,http://localhost:4173',
  },
}));

function createMockResponse(): ServerResponse & {
  headers: Record<string, string | number | string[]>;
} {
  const headers: Record<string, string | number | string[]> = {};
  return {
    headers,
    setHeader(name: string, value: string | number | string[]): void {
      headers[name] = value;
    },
  } as ServerResponse & {
    headers: Record<string, string | number | string[]>;
  };
}

describe('applyCorsHeaders', () => {
  it('sets credentialed CORS headers for allowed origins', () => {
    const request = {
      method: 'POST',
      headers: { origin: 'http://localhost:5173' },
    } as IncomingMessage;
    const response = createMockResponse();
    applyCorsHeaders(request, response);
    expect(response.headers['Access-Control-Allow-Origin']).toBe(
      'http://localhost:5173',
    );
    expect(response.headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(response.headers['Vary']).toBe('Origin');
  });

  it('does not set CORS headers for disallowed origins', () => {
    const request = {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:5173' },
    } as IncomingMessage;
    const response = createMockResponse();
    applyCorsHeaders(request, response);
    expect(response.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(
      response.headers['Access-Control-Allow-Credentials'],
    ).toBeUndefined();
  });
});
