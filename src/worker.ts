import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EnvService } from './_infrastructure/env/env.service';
import { WorkerModule } from './_worker/worker.module';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create(WorkerModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose', 'fatal'],
  });

  const config = app.get(EnvService);
  const port = config.get('WORKER_PORT');

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`worker run in port: ${port}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
