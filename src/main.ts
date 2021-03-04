import { NestFactory } from '@nestjs/core';
import { SentryService } from '@ntegral/nestjs-sentry';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useLogger(app.get(SentryService));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
