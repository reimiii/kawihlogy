import { ConfigModule as CF } from '@nestjs/config';
import { envSchema } from '../env/env';

export const ConfigModule = CF.forRoot({
  validate: (config: Record<string, unknown>) => {
    const env = envSchema.safeParse(config);

    if (env.success) return env.data;

    const errors = env.error.format();
    const errorMessages = Object.entries(errors).map(([key, value]) => {
      const formattedKey = key.split('.').join(' -> ');
      const messages = Array.isArray(value)
        ? value.map((v) => (typeof v === 'string' ? v : undefined))
        : value._errors;
      return `${formattedKey}: ${messages.join(', ')}`;
    });

    throw new Error(
      `invalid environment variables:\n${errorMessages.join('\n')}\n`,
    );
  },
  isGlobal: true,
});
