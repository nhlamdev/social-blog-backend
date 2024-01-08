import { CategoryEntity, ContentEntity } from '@/database/entities';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ContentDto } from './content.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

  async create(payload: ContentDto, category: CategoryEntity) {
    const content = new ContentEntity();

    content.title = payload.title;
    content.body = payload.body;
    content.category = category;
    content.complete = payload.complete;
    content.public = payload.public;

    return await this.contentRepository.save(content);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    payload: QueryDeepPartialEntity<ContentEntity>,
  ) {
    return await this.contentRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.contentRepository.delete(criteria);
  }

  async builder() {
    return await this.contentRepository.createQueryBuilder('content');
  }
}
