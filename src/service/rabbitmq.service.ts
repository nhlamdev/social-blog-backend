import { Controller, Get } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly host = process.env.RABBITMQ_HOST;
  private readonly port = process.env.RABBITMQ_PORT;
  private readonly account = process.env.RABBITMQ_ACCOUNT;
  private readonly password = process.env.RABBITMQ_PASSWORD;

  private clientNotifyQueue: ClientProxy;
  private clientMailQueue: ClientProxy;

  constructor() {
    const connection = `amqp://${this.account}:${this.password}@${this.host}:${this.port}`;

    this.clientNotifyQueue = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [connection],
        queue: process.env.RABBITMQ_QUEUE_NOTIFY_NAME,
        queueOptions: {
          durable: true,
        },
      },
    });

    this.clientMailQueue = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [connection],
        queue: process.env.RABBITMQ_QUEUE_MAIL_NAME,
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  @Get()
  async getHello() {
    const pattern = { cmd: 'message' };
    const data = 'Hello RabbitMQ!';
    return this.clientMailQueue.send(pattern, data);
  }

  @MessagePattern('notifications')
  getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }
}
