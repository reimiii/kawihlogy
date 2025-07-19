import { z } from 'zod';
import 'dotenv/config';

export const envSchema = z.object({
  SERVICE_NAME: z
    .string()
    .max(70)
    .nonempty('SERVICE_NAME is required')
    .refine((val) => val.trim() !== '', {
      message: 'SERVICE_NAME cannot be empty or spaces',
    }),

  CORS_ORIGIN: z.string().url().nonempty('CORS_ORIGIN is required'),
  PORT: z.coerce.number().int({ message: 'PORT must be an integer' }),
  WORKER_PORT: z.coerce
    .number()
    .int({ message: 'WORKER_PORT must be an integer' }),

  NODE_ENV: z.enum(['development', 'production', 'test'], {
    errorMap: () => ({
      message: 'NODE_ENV must be one of development, production, test',
    }),
  }),

  DB_TYPE: z.enum(['postgres', 'mysql', 'sqlite'], {
    errorMap: () => ({ message: 'DB_TYPE must be postgres, mysql, or sqlite' }),
  }),
  DB_SYNCHRONIZE: z.coerce.boolean().default(false),
  DB_LOGGING: z.coerce.boolean().default(false),
  DB_HOST: z
    .string()
    .nonempty('DB_HOST is required')
    .refine((val) => val.trim() !== '', {
      message: 'DB_HOST cannot be empty or spaces',
    }),
  DB_PORT: z.coerce.number().int({ message: 'DB_PORT must be an integer' }),
  DB_USERNAME: z
    .string()
    .nonempty('DB_USERNAME is required')
    .refine((val) => val.trim() !== '', {
      message: 'DB_USERNAME cannot be empty or spaces',
    }),
  DB_PASSWORD: z
    .string()
    .nonempty('DB_PASSWORD is required')
    .refine((val) => val.trim() !== '', {
      message: 'DB_PASSWORD cannot be empty or spaces',
    }),
  DB_NAME: z
    .string()
    .nonempty('DB_NAME is required')
    .refine((val) => val.trim() !== '', {
      message: 'DB_NAME cannot be empty or spaces',
    }),

  JWT_SECRET: z
    .string()
    .nonempty('JWT_SECRET is required')
    .refine((val) => val.trim() !== '', {
      message: 'JWT_SECRET cannot be empty or spaces',
    }),
  JWT_EXPIRES_IN: z
    .string()
    .nonempty('JWT_EXPIRES_IN is required')
    .refine((val) => val.trim() !== '', {
      message: 'JWT_EXPIRES_IN cannot be empty or spaces',
    }),

  REDIS_HOST: z
    .string()
    .nonempty('REDIS_HOST is required')
    .refine((val) => val.trim() !== '', {
      message: 'REDIS_HOST cannot be empty or spaces',
    }),
  REDIS_PORT: z.coerce
    .number()
    .int({ message: 'REDIS_PORT must be an integer' }),

  GEMINI_API_KEY: z
    .string()
    .nonempty('GEMINI_API_KEY is required')
    .refine((val) => val.trim() !== '', {
      message: 'GEMINI_API_KEY cannot be empty or spaces',
    }),

  AWS_REGION: z
    .string()
    .nonempty('AWS_REGION is required')
    .refine((val) => val.trim() !== '', {
      message: 'AWS_REGION cannot be empty or spaces',
    }),
  AWS_ACCESS_KEY_ID: z
    .string()
    .nonempty('AWS_ACCESS_KEY_ID is required')
    .refine((val) => val.trim() !== '', {
      message: 'AWS_ACCESS_KEY_ID cannot be empty or spaces',
    }),
  AWS_SECRET_ACCESS_KEY: z
    .string()
    .nonempty('AWS_SECRET_ACCESS_KEY is required')
    .refine((val) => val.trim() !== '', {
      message: 'AWS_SECRET_ACCESS_KEY cannot be empty or spaces',
    }),
  AWS_S3_BUCKET_NAME: z
    .string()
    .nonempty('AWS_S3_BUCKET_NAME is required')
    .refine((val) => val.trim() !== '', {
      message: 'AWS_S3_BUCKET_NAME cannot be empty or spaces',
    }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const Env = parsed.data;
export type Env = z.infer<typeof envSchema>;
