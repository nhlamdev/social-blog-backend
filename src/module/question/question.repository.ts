import { IBaseRepository } from '@/shared/base/IBase.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './question.entity';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class QuestionRepository implements IBaseRepository<QuestionEntity> {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
  ) {}

  async findOne(options?: FindOneOptions<QuestionEntity>) {
    return await this.questionRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<QuestionEntity>) {
    return await this.questionRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<QuestionEntity>) {
    const [result, count] = await this.questionRepository.findAndCount(options);

    return { result, count };
  }

  async exist(options?: FindManyOptions<QuestionEntity>) {
    return this.questionRepository.exist(options);
  }

  async count(options?: FindManyOptions<QuestionEntity>) {
    return this.questionRepository.count(options);
  }

  async create(instance: DeepPartial<QuestionEntity>) {
    return await this.questionRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria<QuestionEntity>,
    options?: QueryDeepPartialEntity<QuestionEntity>,
  ) {
    return await this.questionRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria<QuestionEntity>) {
    return await this.questionRepository.delete(criteria);
  }

  async builder() {
    return this.questionRepository.createQueryBuilder('question');
  }
}
