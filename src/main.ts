import { NestFactory } from '@nestjs/core';
import { SentryService } from '@ntegral/nestjs-sentry';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ErrorFilter } from './common/filters/error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ErrorFilter(), new HttpExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
