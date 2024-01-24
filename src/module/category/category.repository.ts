import { IBaseRepository } from '@/shared/base/IBase.repository';
import { Injectable } from '@nestjs/common';
import { CategoryEntity } from './category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CategoryDto } from './category.dto';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class CategoryRepository implements IBaseRepository<CategoryEntity> {
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
