import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { json } from 'express';
import { ResponseInterceptor, HttpExceptionFilter } from './common/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 이미지 업로드를 위해 body 크기 제한 증가 (10MB)
  app.use(json({ limit: '10mb' }));

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
