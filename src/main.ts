import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { EnvService } from './_infrastructure/env/env.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(EnvService);
  const port = config.get('PORT');

  dayjs.extend(isSameOrBefore);
  dayjs.extend(customParseFormat);

  // app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap();
