import { Controller, Get } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  private clientNotifyQueue: ClientProxy;
  private clientMailQueue: ClientProxy;

  constructor() {
    this.clientNotifyQueue = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'notify_queue',
        queueOptions: {
          durable: false,
        },
      },
    });

    this.clientMailQueue = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'mail_queue',
        queueOptions: {
          durable: false,
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
}
