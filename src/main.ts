import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { AppModule } from './app.module';
// import { ConfigService } from './service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const configService = app.select(AppModule).get(ConfigService);
  // const configService = app.get(ConfigService);

  app.enableCors();
  app.use(cookieParser());
  app.use(helmet());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe());

  dotenv.config();

  if (process.env.MODE !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('authen api docs')
      .setDescription('api for hoang lam blog')
      .setVersion('1.0.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const port = process.env.SERVICE_PORT;

  if (!port) {
    Logger.error(`Cannot read env port`);
  }

  await app.listen(port);

  Logger.warn(`The server is running on port http://localhost:${port}`);
}

bootstrap();
