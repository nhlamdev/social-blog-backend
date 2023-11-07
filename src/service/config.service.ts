import { Injectable } from '@nestjs/common';
// import { RmqOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class GlobalConfigService {
  constructor() {
    dotenv.config({
      path: `.env`,
    });

    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  public getBoolean(key: string): boolean {
    return Boolean(this.get(key));
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  // public getRmqOptions(queue: string): RmqOptions {
  // 	const USER = this.rabbitMQ.user;
  // 	const PASSWORD = this.rabbitMQ.password;
  // 	const HOST = this.rabbitMQ.host;
  // 	const PORT = this.rabbitMQ.port;

  // 	const url = `amqp://${USER}:${PASSWORD}@${HOST}:${PORT}`;

  // 	return {
  // 		transport: Transport.RMQ,
  // 		options: {
  // 			urls: [url],
  // 			noAck: false,
  // 			queue,
  // 			queueOptions: {
  // 				durable: true,
  // 				// set message time to live to 4s
  // 				// messageTtl: 4000,
  // 			},
  // 		},
  // 	};
  // }

  get eventStoreConfig() {
    return {
      protocol: this.get('EVENT_STORE_PROTOCOL') || 'http',
      connectionSettings: {
        defaultUserCredentials: {
          username: this.get('EVENT_STORE_CREDENTIALS_USERNAME') || 'admin',
          password: this.get('EVENT_STORE_CREDENTIALS_PASSWORD') || 'changeit',
        },
        verboseLogging: true,
        failOnNoServerResponse: true,
        // log: console, // TODO: improve Eventstore logger (separate chanel)
      },
      tcpEndpoint: {
        host: this.get('EVENT_STORE_HOSTNAME') || 'localhost',
        port: this.getNumber('EVENT_STORE_TCP_PORT') || 1113,
      },
      httpEndpoint: {
        host: this.get('EVENT_STORE_HOSTNAME') || 'localhost',
        port: this.getNumber('EVENT_STORE_HTTP_PORT') || 2113,
      },
      poolOptions: {
        min: this.getNumber('EVENT_STORE_POOLOPTIONS_MIN') || 1,
        max: this.getNumber('EVENT_STORE_POOLOPTIONS_MAX') || 10,
      },
    };
  }

  get winstonConfig(): winston.LoggerOptions {
    return {
      transports: [
        new DailyRotateFile({
          level: 'debug',
          filename: `./logs/${this.nodeEnv}/debug-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new DailyRotateFile({
          level: 'error',
          filename: `./logs/${this.nodeEnv}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.simple(),
          ),
        }),
      ],
      exitOnError: false,
    };
  }

  get newRelicConfig() {
    return {
      appName: this.get('NEW_RELIC_APP_NAME'),
      licenseKey: this.get('NEW_RELIC_LICENSE_KEY'),
    };
  }

  get gcpStorageBucket(): string {
    return this.get('GCP_STORAGE_BUCKET') || '';
  }

  get rabbitMQ() {
    return {
      user: this.get('RABBITMQ_USER') || '',
      password: this.get('RABBITMQ_PASSWORD') || '',
      host: this.get('RABBITMQ_HOST') || '',
      port: this.get('RABBITMQ_PORT') || '',
      transporter: this.get('RABBITMQ_TRANSPORTER') || 'amqp',
    };
  }

  get elasticSearch() {
    return {
      url: this.get('ELASTIC_HOST') || 'localhost',
      port: this.get('ELASTIC_PORT') || 9200,
      auth: this.getBoolean('ELASTIC_AUTH') || false,
      user: this.get('ELASTIC_USERNAME') || '',
      password: this.get('ELASTIC_PASSWORD') || '',
      indexPrefix: this.get('ELASTIC_PREFIX') || '',
    };
  }

  get redis() {
    return {
      host: this.get('REDIS_HOST') || 'localhost',
      port: this.get('REDIS_PORT') || 6379,
      pass: this.get('REDIS_PASSWORD'),
      db: this.get('REDIS_DB'),
    };
  }

  get redisForBull() {
    return {
      host: this.get('REDIS_HOST'),
      port: Number(this.get('REDIS_PORT')),
      password: this.get('REDIS_PASSWORD'),
      db: Number(this.get('REDIS_DB')),
    };
  }

  get mail() {
    return {
      host: this.get('MAIL_HOST'),
      user: this.get('MAIL_USER'),
      pass: this.get('MAIL_PASSWORD'),
      from: this.get('MAIL_FROM'),
    };
  }

  get cron() {
    return Number.parseInt(this.get('CRON'));
  }

  get cubeConfig() {
    return {
      url: this.get('CUBE_URL') || '',
      token: this.get('CUBE_TOKEN') || '',
    };
  }

  get portal() {
    return this.get('PORTAL_URL');
  }

  get mqtt() {
    return {
      host: this.get('MQTT_HOST'),
      port: this.getNumber('MQTT_PORT'),
    };
  }

  get smsProvider(): string {
    return this.get('SMS_PROVIDER') || '';
  }

  get smsVietguys(): Record<string, string | number> {
    return {
      url: this.get('SMS_ENDPOINT') || '',
      username: this.get('SMS_USERNAME') || '',
      passCode: this.get('SMS_PASSWORD') || '',
      bid: this.get('SMS_BID') || '',
      from: this.get('SMS_FROM') || '',
      template: this.get('SMS_BIRTHDAY_COUPON_TMPL') ?? '',
    };
  }

  get smsTwilio(): Record<string, string> {
    return {
      accountSid: this.get('TWILIO_ACCOUNT_SID'),
      authToken: this.get('TWILIO_AUTH_TOKEN'),
      fromPhoneNumber: this.get('TWILIO_PHONE_NUMBER'),
      messagingServiceSid: this.get('TWILIO_SERVICE_SID'),
      template: this.get('SMS_BIRTHDAY_COUPON_TMPL') ?? '',
    };
  }

  get smsStringee(): Record<string, string | number> {
    return {
      url: this.get('SMS_ENDPOINT') || '',
      token: this.get('SMS_STRINGEE_TOKEN') || '',
      from: this.get('SMS_FROM') || '',
    };
  }
}
