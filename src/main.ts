import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './common/config/env';
import { ApiResponseInterceptor } from './common/http/api-response.interceptor';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { AppLoggerService } from './common/logging/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useLogger(app.get(AppLoggerService));
  await app.register(fastifyHelmet);
  await app.register(fastifyCookie);
  await app.register(fastifyMultipart, {
    limits: { fileSize: env.MAX_UPLOAD_BYTES },
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CryJournal API')
    .setDescription('OpenAPI documentation for CryJournal')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs/openapi.json',
  });

  await app.listen(env.PORT, '0.0.0.0');
}
bootstrap();
