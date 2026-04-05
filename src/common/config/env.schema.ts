import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development')
    .describe('Runtime environment: development, test, or production.'),
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000)
    .describe('HTTP server port number (positive integer).'),
  DATABASE_URL: z
    .string()
    .min(1)
    .describe('Database connection string (minimum 1 character).'),
  JWT_SECRET: z
    .string()
    .min(16)
    .default('local-jwt-secret-change-me')
    .describe('JWT signing secret with minimum 16 characters.'),
  JWT_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(3600)
    .describe('JWT expiration time in seconds.'),
  GOOGLE_CLIENT_ID: z
    .string()
    .default('replace-google-client-id')
    .describe('Google OAuth client identifier.'),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .default('replace-google-client-secret')
    .describe('Google OAuth client secret.'),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3000/api/v1/auth/google/callback')
    .describe('Google OAuth callback URL.'),
  UPLOAD_DIR: z
    .string()
    .default('uploads')
    .describe('Directory path used for uploaded files.'),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024)
    .describe('Maximum upload size in bytes.'),
  LOGIN_MAX_ATTEMPTS: z.coerce
    .number()
    .int()
    .positive()
    .default(5)
    .describe('Maximum failed login attempts before lockout.'),
  LOGIN_LOCKOUT_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(15)
    .describe('Login lockout duration in minutes.'),
  ADMIN_EMAIL: z
    .email()
    .default('admin@cryjournal.local')
    .describe('Default administrator email address.'),
  ADMIN_PASSWORD: z
    .string()
    .min(8)
    .default('ChangeMe123!')
    .describe('Default administrator password with minimum 8 characters.'),
  ADMIN_NAME: z
    .string()
    .default('Admin')
    .describe('Default administrator display name.'),
});

export type EnvConfig = z.infer<typeof envSchema>;
