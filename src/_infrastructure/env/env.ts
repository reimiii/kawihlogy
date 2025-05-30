import { z } from 'zod';

export const envSchema = z.object({
  SERVICE_NAME: z.string().max(70),
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  DB_TYPE: z.enum(['postgres', 'mysql']),
  DB_SYNCHRONIZE: z.coerce.boolean().default(false),
  DB_LOGGING: z.coerce.boolean().default(false),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  GEMINI_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;
