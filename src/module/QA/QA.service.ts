import { Injectable } from '@nestjs/common';
import { QARepository } from './QA.repository';

@Injectable()
export class QAService extends QARepository {}
