import './configs/env.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import SwaggerConfig from './configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // set App configs
  app.enableCors({ origin: '*' });
  app.use(cookieParser());
  app.setGlobalPrefix('/api');

  // Swagger conifg
  SwaggerConfig(app);
  //  App Run
  const { PORT } = process.env;
  await app.listen(PORT, () => {
    console.log(`Server Run http://localhost:${PORT}/api`);
    console.log(`Swagger Run http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
