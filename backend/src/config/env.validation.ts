import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  DB_URL: z.string().url('DB_URL must be a valid URL'),
});
