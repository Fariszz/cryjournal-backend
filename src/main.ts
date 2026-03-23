import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { ApiResponseInterceptor } from './common/http/api-response.interceptor';
import { AppLoggerService } from './common/logging/app-logger.service';
import { env } from './common/config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule); // ❗ tanpa FastifyAdapter

  app.useLogger(app.get(AppLoggerService));

  // Middleware Express
  app.use(helmet());
  app.use(cookieParser());

  // Global config
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CryJournal API')
    .setDescription('OpenAPI documentation for CryJournal')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs/openapi.json',
  });

  await app.listen(env.PORT); // ❗ tidak perlu host
}

void bootstrap().catch((error: unknown) => {
  console.error('Failed to bootstrap application', error);
  process.exit(1);
});
