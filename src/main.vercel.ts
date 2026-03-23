import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { ApiResponseInterceptor } from './common/http/api-response.interceptor';
import { AppLoggerService } from './common/logging/app-logger.service';
import { IncomingMessage, ServerResponse } from 'http';

let cachedApp: NestExpressApplication;

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(app.get(AppLoggerService));
  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CryJournal API')
    .setDescription('OpenAPI documentation for CryJournal')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs/openapi.json',
  });

  await app.init(); // ← init(), bukan listen()

  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }

  // Ambil Express instance dari NestJS app
  const expressApp = cachedApp.getHttpAdapter().getInstance();
  expressApp(req, res);
}
