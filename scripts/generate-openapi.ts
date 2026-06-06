import 'reflect-metadata';
import 'dotenv/config';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import type { AppModule as AppModuleType } from '../src/app.module';

async function createApplication(): Promise<INestApplication> {
  const distAppModulePath = join(process.cwd(), 'dist', 'app.module.js');
  if (!existsSync(distAppModulePath)) {
    throw new Error(
      'Missing dist/app.module.js. Run "pnpm run build" before generating OpenAPI docs.',
    );
  }
  const { AppModule } = (await import(
    pathToFileURL(distAppModulePath).href
  )) as { AppModule: typeof AppModuleType };
  return NestFactory.create(AppModule, { logger: false });
}

async function generateOpenApi(): Promise<void> {
  const app = await createApplication();
  app.setGlobalPrefix('api/v1');
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
  const swaggerDocument = cleanupOpenApiDoc(
    SwaggerModule.createDocument(app, swaggerConfig),
  );
  const docsDirectory = join(process.cwd(), 'docs');
  const outputPath = join(docsDirectory, 'openapi.json');
  mkdirSync(docsDirectory, { recursive: true });
  writeFileSync(
    outputPath,
    `${JSON.stringify(swaggerDocument, null, 2)}\n`,
    'utf8',
  );
  await app.close();
  process.stdout.write(`Generated ${outputPath}\n`);
}

generateOpenApi().catch((error: unknown) => {
  console.error('[docs:openapi] failed');
  console.error(error);
  process.exit(1);
});
