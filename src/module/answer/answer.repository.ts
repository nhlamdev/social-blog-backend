import { IBaseRepository } from '@/shared/base/IBase.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class AnswerRepository implements IBaseRepository<AnswerEntity> {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly questionRepository: Repository<AnswerEntity>,
  ) {}

  async findOne(options?: FindOneOptions<AnswerEntity>) {
    return await this.questionRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<AnswerEntity>) {
    return await this.questionRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<AnswerEntity>) {
    const [result, count] = await this.questionRepository.findAndCount(options);

    return { result, count };
  }

  async exist(options?: FindManyOptions<AnswerEntity>) {
    return this.questionRepository.exist(options);
  }

  async count(options?: FindManyOptions<AnswerEntity>) {
    return this.questionRepository.count(options);
  }

  async create(instance: DeepPartial<AnswerEntity>) {
    return await this.questionRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria<AnswerEntity>,
    options?: QueryDeepPartialEntity<AnswerEntity>,
  ) {
    return await this.questionRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria<AnswerEntity>) {
    return await this.questionRepository.delete(criteria);
  }

  async builder() {
    return this.questionRepository.createQueryBuilder('question');
  }
}
