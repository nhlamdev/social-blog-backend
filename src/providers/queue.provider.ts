import { ClientsModule, Transport } from '@nestjs/microservices';

const { RABBITMQ_QUEUE_NOTIFY_NAME, RABBITMQ_QUEUE_MAIL_NAME } = process.env;

export const queues_name = [
  RABBITMQ_QUEUE_NOTIFY_NAME,
  RABBITMQ_QUEUE_MAIL_NAME,
];

const host = process.env.RABBITMQ_HOST;
const port = process.env.RABBITMQ_PORT;
const account = process.env.RABBITMQ_USER;
const password = process.env.RABBITMQ_PASSWORD;

const connection = `amqp://${account}:${password}@${host}:${port}`;

console.log('connection  1 : ', connection);
const queues_register = queues_name.map((v: string) => {
  const queue = {
    name: v,
    transport: Transport.RMQ as number,
    options: {
      urls: [connection],
      queue: v,
      queueOptions: {
        durable: false,
      },
    },
  };

  return queue;
});
export const queue_provider = ClientsModule.register(queues_register);
