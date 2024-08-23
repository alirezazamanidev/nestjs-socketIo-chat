import './configs/env.config'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express';
import { urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // set App configs
  app.enableCors({origin:"*"});
  app.use(cookieParser());
  app.setGlobalPrefix('/api');

  //  App Run 
  const {PORT}=process.env
  await app.listen(PORT,()=>{
    console.log(`Server Run http://localhost:${PORT}/api`);
    console.log(`Swagger Run http://localhost:${PORT}/swagger`);
    
  })
}
bootstrap();
