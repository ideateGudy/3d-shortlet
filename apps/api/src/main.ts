import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // Serve static files for local uploads and placeholders
  const uploadsPath = path.resolve(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  app.use('/placeholders', express.static(path.join(uploadsPath, 'placeholders')));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 3D Shortlet API listening on http://localhost:${port}`);
}

bootstrap();
