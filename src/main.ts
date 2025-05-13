import { NestFactory } from '@nestjs/core';
import { EnvService } from './_infrastructure/env/env.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(EnvService);
  const port = config.get('PORT');

  // app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap();
