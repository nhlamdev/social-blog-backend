import { queueProcessors } from '@/constants/queue';
import { Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';

const processorsKey = queueProcessors.SESSION_QUEUE;

@Injectable({})
@Processor(processorsKey)
export class SessionService {}
