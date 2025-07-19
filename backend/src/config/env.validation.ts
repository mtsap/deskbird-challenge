import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST is required'),
  POSTGRES_PORT: z.string().transform(Number).default(5432),
});
