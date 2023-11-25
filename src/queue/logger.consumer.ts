import { Processor } from '@nestjs/bull';

@Processor('queue-logger')
export class LoggerConsumer {}
