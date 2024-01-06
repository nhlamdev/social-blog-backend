import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeriesEntity } from '@/database/entities';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { SeriesDto } from '@/model';
import { TypeTypeOrmCriteria } from '@/utils/criteria-key.typeorm';

@Injectable()
export class SeriesService {
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

  async exist(options?: FindManyOptions<SeriesEntity>) {
    return this.seriesRepository.exist(options);
  }

  async count(options?: FindManyOptions<SeriesEntity>) {
    return this.seriesRepository.count(options);
  }

  async create(payload: SeriesDto) {
    const category = new SeriesEntity();
    category.title = payload.title;
    category.description = payload.description;

    return await this.seriesRepository.save(category);
  }

  async update(criteria: TypeTypeOrmCriteria, payload: SeriesDto) {
    return await this.seriesRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.seriesRepository.delete(criteria);
  }

  async softDelete(criteria: TypeTypeOrmCriteria) {
    return await this.seriesRepository.softDelete(criteria);
  }

  async builder() {
    return await this.seriesRepository.createQueryBuilder('category');
  }
}
