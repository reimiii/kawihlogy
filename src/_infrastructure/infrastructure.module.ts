import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
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
    }),

    // Infrastructure modules
    EnvModule,
    DatabaseModule,
  ],
})
export class InfrastructureModule {}
