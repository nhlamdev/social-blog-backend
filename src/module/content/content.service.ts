import { IBaseService } from '@/shared/base/base.service';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ContentEntity } from './content.entity';

@Injectable()
export class ContentService implements IBaseService<ContentEntity> {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}
  async findAllAndCount(
    options?: FindManyOptions<ContentEntity>,
  ): Promise<{ result: ContentEntity[]; count: number }> {
    const [result, count] = await this.contentRepository.findAndCount(options);

    return { result, count };
  }
  async softDelete?(
    criteria: TypeTypeOrmCriteria<ContentEntity>,
  ): Promise<UpdateResult> {
    return this.contentRepository.softDelete(criteria);
  }

  async findOne(options?: FindOneOptions<ContentEntity>) {
    return await this.contentRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<ContentEntity>) {
    return await this.contentRepository.find(options);
  }

  async exist(options?: FindManyOptions<ContentEntity>) {
    return this.contentRepository.exist(options);
  }

  async count(options?: FindManyOptions<ContentEntity>) {
    return this.contentRepository.count(options);
  }

  async create(instance: DeepPartial<ContentEntity>) {
    return await this.contentRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria<ContentEntity>,
    payload: QueryDeepPartialEntity<ContentEntity>,
  ) {
    return await this.contentRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria<ContentEntity>) {
    return await this.contentRepository.delete(criteria);
  }

  async builder() {
    return await this.contentRepository.createQueryBuilder('content');
  }
}
