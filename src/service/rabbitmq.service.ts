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
  private clientNotifyQueue: ClientProxy;
  private clientMailQueue: ClientProxy;

  constructor() {
    this.clientNotifyQueue = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'notify_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.clientMailQueue = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'mail_queue',
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
