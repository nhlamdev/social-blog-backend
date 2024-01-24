import { IBaseRepository } from '@/shared/base/IBase.repository';
import { Injectable } from '@nestjs/common';
import { FileEntity } from './file.entity';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileRepository implements IBaseRepository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    private memberRepository: Repository<FileEntity>,
  ) {}
  async findOne(options?: FindOneOptions<FileEntity>) {
    return await this.memberRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<FileEntity>) {
    return await this.memberRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<FileEntity>) {
    const [result, count] = await this.memberRepository.findAndCount(options);

    return { result, count };
  }

  async exist(options?: FindManyOptions<FileEntity>) {
    return this.memberRepository.exist(options);
  }

  async count(options?: FindManyOptions<FileEntity>) {
    return this.memberRepository.count(options);
  }

  async create(instance: DeepPartial<FileEntity>) {
    return await this.memberRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria<FileEntity>,
    options?: QueryDeepPartialEntity<FileEntity>,
  ) {
    return await this.memberRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria<FileEntity>) {
    return await this.memberRepository.delete(criteria);
  }

  async builder() {
    return this.memberRepository.createQueryBuilder('member');
  }
}
