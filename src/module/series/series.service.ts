import { SeriesEntity } from '@/database/entities';
import { IBaseService } from '@/shared/base/base.service';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class SeriesService implements IBaseService<SeriesEntity> {
  constructor(
    @InjectRepository(SeriesEntity)
    private seriesRepository: Repository<SeriesEntity>,
  ) {}

  async findOne(options?: FindOneOptions<SeriesEntity>) {
    return await this.seriesRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<SeriesEntity>) {
    return await this.seriesRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<SeriesEntity>) {
    const [result, count] = await this.seriesRepository.findAndCount(options);

    return { result, count };
  }

  async exist(options?: FindManyOptions<SeriesEntity>) {
    return this.seriesRepository.exist(options);
  }

  async count(options?: FindManyOptions<SeriesEntity>) {
    return this.seriesRepository.count(options);
  }

  async create(instance: DeepPartial<SeriesEntity>) {
    return await this.seriesRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    payload: QueryDeepPartialEntity<SeriesEntity>,
  ) {
    return await this.seriesRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.seriesRepository.delete(criteria);
  }

  async softDelete(criteria: TypeTypeOrmCriteria) {
    return await this.seriesRepository.softDelete(criteria);
  }

  async builder() {
    return await this.seriesRepository.createQueryBuilder('series');
  }
}
