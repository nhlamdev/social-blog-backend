import { Repository } from 'typeorm';
import { QuestionEntity } from './question.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    public readonly repository: Repository<QuestionEntity>,
  ) {}
}
