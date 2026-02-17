import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { BaseModule } from './base.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(BaseModule);

  /**
   * -----------------------------------------------------
   * CORS - Must be enabled FIRST to handle preflight requests
   * -----------------------------------------------------
   */
  app.enableCors({
    origin: [
      'https://electrozane.com',
      'https://www.electrozane.com',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  });

  /**
   * -----------------------------------------------------
   * Static Assets
   * -----------------------------------------------------
   */
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.enableVersioning();

  
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Sky-S API')
      .setDescription('API documentation for the Sky-S application')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }


  const port = process.env.MAIN_APP_PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on ${await app.getUrl()}`);
}

bootstrap();
