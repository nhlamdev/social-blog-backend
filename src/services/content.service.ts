import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CategoryEntity,
  ContentEntity,
  SeriesEntity,
} from '@/database/entities';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { TypeTypeOrmCriteria } from '@/utils/criteria-key.typeorm';
import { ContentDto } from '../model';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

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

  async create(
    payload: ContentDto,
    category: CategoryEntity,
    series: SeriesEntity,
  ) {
    const content = new ContentEntity();

    content.title = payload.title;
    content.body = payload.body;
    content.category = category;
    content.series = series;
    content.complete = payload.complete;
    content.public = payload.public;

    return await this.contentRepository.save(content);
  }

  // async update(criteria: TypeTypeOrmCriteria, payload: ContentDto) {
  //   return await this.contentRepository.update(criteria, payload);
  // }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.contentRepository.delete(criteria);
  }

  async builder() {
    return await this.contentRepository.createQueryBuilder('category');
  }
}
