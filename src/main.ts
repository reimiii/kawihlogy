import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './_infrastructure/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const config = app.get(EnvService);
  const port = config.get('PORT');

  await app.listen(port);
}

bootstrap().catch(() => new Error('Failed to start the application'));
