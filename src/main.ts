import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import * as useragent from "express-useragent"


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.use(useragent.express())
  const config = new DocumentBuilder().setTitle("Team Acess Control API").setDescription("Heres the guide of team acess cotrol api").setVersion("1.0.0").build();

  const documentFactory = ()=>SwaggerModule.createDocument(app,config);
  SwaggerModule.setup("api",app,documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
