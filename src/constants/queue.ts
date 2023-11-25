import { BullModuleOptions } from '@nestjs/bull';

export const QUEUE_NOTIFY = 'QUEUE_NOTIFY';
export const QUEUE_MAIL = 'QUEUE_MAIL';
export const QUEUE_LOGGER = 'QUEUE_LOGGER';

const queues_name = [QUEUE_NOTIFY, QUEUE_MAIL, QUEUE_LOGGER];

export const QueuesRegisterConfig = queues_name.map(
  (name): BullModuleOptions => {
    return { name: name, settings: {}, limiter: { max: 30, duration: 1000 } };
  },
);
