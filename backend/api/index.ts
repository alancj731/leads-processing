import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from '../src/app.module.js';
import type { Express } from 'express';

let app: Express;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);
  nestApp.enableCors();
  nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
  nestApp.use(json({ limit: '50mb' }));
  await nestApp.init();
  return nestApp.getHttpAdapter().getInstance() as Express;
}

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await bootstrap();
  }
  app(req, res);
}
