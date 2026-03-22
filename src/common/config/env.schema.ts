import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16).default('local-jwt-secret-change-me'),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
  GOOGLE_CLIENT_ID: z.string().default('replace-google-client-id'),
  GOOGLE_CLIENT_SECRET: z.string().default('replace-google-client-secret'),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3000/api/v1/auth/google/callback'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),
  ADMIN_EMAIL: z.email().default('admin@cryjournal.local'),
  ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  ADMIN_NAME: z.string().default('Admin'),
});

export type EnvConfig = z.infer<typeof envSchema>;
