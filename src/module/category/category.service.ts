import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CategoryDto } from './category.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IBaseService } from '@/shared/base/base.service';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoryService implements IBaseService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findOne(options?: FindOneOptions<CategoryEntity>) {
    return await this.categoryRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<CategoryEntity>) {
    return await this.categoryRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<CategoryEntity>) {
    const [result, count] = await this.categoryRepository.findAndCount(options);
    return { result, count };
  }

  async exist(options?: FindManyOptions<CategoryEntity>) {
    return this.categoryRepository.exist(options);
  }

  async count(options?: FindManyOptions<CategoryEntity>) {
    return this.categoryRepository.count(options);
  }

  async create(payload: CategoryDto) {
    const category = new CategoryEntity();
    category.title = payload.title;
    category.description = payload.description;

    return await this.categoryRepository.save(category);
  }

  async update(
    criteria: TypeTypeOrmCriteria<CategoryEntity>,
    payload: QueryDeepPartialEntity<CategoryEntity>,
  ) {
    return await this.categoryRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria<CategoryEntity>) {
    return await this.categoryRepository.delete(criteria);
  }

  async softDelete(criteria: TypeTypeOrmCriteria<CategoryEntity>) {
    return await this.categoryRepository.softDelete(criteria);
  }

  async builder() {
    return await this.categoryRepository.createQueryBuilder('category');
  }
}
