import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { EnvService } from './_infrastructure/env/env.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose', 'fatal'],
  });

  const config = app.get(EnvService);
  const port = config.get('PORT');

  dayjs.extend(isSameOrBefore);
  dayjs.extend(customParseFormat);

  // app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableShutdownHooks();

  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
