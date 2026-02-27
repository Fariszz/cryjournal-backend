import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default('local-access-secret-change-me'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('local-refresh-secret-change-me'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(1800),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(2592000),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),
  ADMIN_EMAIL: z.string().email().default('admin@cryjournal.local'),
  ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  ADMIN_NAME: z.string().default('Admin'),
});

export type EnvConfig = z.infer<typeof envSchema>;
