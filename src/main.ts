import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { EnvService } from './_infrastructure/env/env.service';
import { AppModule } from './_app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose', 'fatal'],
  });

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const config = app.get(EnvService);
  const port = config.get('PORT');

  dayjs.extend(isSameOrBefore);
  dayjs.extend(customParseFormat);

  app.enableShutdownHooks();

  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
