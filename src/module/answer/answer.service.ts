import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(AnswerEntity)
    public readonly repository: Repository<AnswerEntity>,
  ) {}
}
