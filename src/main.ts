import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import * as useragent from "express-useragent"
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { json, urlencoded } from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser())
  app.use(useragent.express())
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  const corsOrigins = process.env.CORS_ORIGINS?.split(",").map(o=>o.trim()) ?? ["http://localhost:3000"];
  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle("Team Acess Control API")
    .setDescription("Heres the guide of team acess cotrol api")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const documentFactory = ()=>SwaggerModule.createDocument(app,config);
  SwaggerModule.setup("api",app,documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
