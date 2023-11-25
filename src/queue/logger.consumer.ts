import { QUEUE_LOGGER } from '@/constants/queue';
import { Processor } from '@nestjs/bull';

@Processor(QUEUE_LOGGER)
export class LoggerConsumer {}
