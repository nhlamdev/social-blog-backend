import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as compression from 'compression';

import helmet from 'helmet';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
// import { ConfigService } from './service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const host = process.env.RABBITMQ_HOST;
  const portRabbitmq = process.env.RABBITMQ_PORT;
  const account = process.env.RABBITMQ_USER;
  const password = process.env.RABBITMQ_PASSWORD;

  const connection = `amqp://${account}:${password}@${host}:${portRabbitmq}`;
  console.log('connection 2 : ', connection);

  await app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [connection],
      queue: process.env.RABBITMQ_QUEUE_NOTIFY_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [connection],
      queue: process.env.RABBITMQ_QUEUE_MAIL_NAME,
      queueOptions: {
        durable: true,
      },
    },
  });

  app.enableCors();
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe());

  dotenv.config();

  if (process.env.NODE_ENV !== 'production') {
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

  await app.startAllMicroservices();
  await app.listen(port);

  Logger.warn(`The server is running on port http://localhost:${port}`);
}

bootstrap();
