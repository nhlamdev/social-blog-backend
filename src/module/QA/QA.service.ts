import { IBaseService } from '@/shared/base/IBase.service';
import { Injectable } from '@nestjs/common';
import { QAEntity } from './QA.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { DeepPartial } from '@/shared/utils/types/deep-partial.type';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class QAService implements IBaseService<QAEntity> {
  constructor(
    @InjectRepository(QAEntity)
    private memberRepository: Repository<QAEntity>,
  ) {}
  async findOne(options?: FindOneOptions<QAEntity>) {
    return await this.memberRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<QAEntity>) {
    return await this.memberRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<QAEntity>) {
    const [result, count] = await this.memberRepository.findAndCount(options);

    return { result, count };
  }

  async exist(options?: FindManyOptions<QAEntity>) {
    return this.memberRepository.exist(options);
  }

  async count(options?: FindManyOptions<QAEntity>) {
    return this.memberRepository.count(options);
  }

  async create(instance: DeepPartial<QAEntity>) {
    return await this.memberRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria<QAEntity>,
    options?: QueryDeepPartialEntity<QAEntity>,
  ) {
    return await this.memberRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria<QAEntity>) {
    return await this.memberRepository.delete(criteria);
  }

  async builder() {
    return this.memberRepository.createQueryBuilder('member');
  }
}
