import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Prefix global '/api' persis sesuai kontrak frontend VITE_API_BASE_URL
  app.setGlobalPrefix('api');

  // CORS diaktifkan untuk frontend Vite (http://localhost:5173 dsb)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validasi request body menggunakan class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Setup Swagger Documentation & API Simulation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MedikaScale API')
    .setDescription(
      'Dokumentasi dan Simulator API MedikaScale: Autentikasi RBAC granular, Antrian Poliklinik Anak, Chatbot WhatsApp, Antropometri WHO, dan Stubs Modul Klinis',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 MedikaScale Backend berjalan di: http://localhost:${port}/api`);
  logger.log(`📚 Swagger Docs & WA Simulator:    http://localhost:${port}/docs`);
  logger.log(`=======================================================`);
}
bootstrap();
