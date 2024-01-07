import { CategoryEntity } from '@/database/entities';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CategoryDto } from './category.dto';

@Injectable()
export class CategoryService {
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

  async update(criteria: TypeTypeOrmCriteria, payload: CategoryDto) {
    return await this.categoryRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.categoryRepository.delete(criteria);
  }

  async softDelete(criteria: TypeTypeOrmCriteria) {
    return await this.categoryRepository.softDelete(criteria);
  }

  async builder() {
    return await this.categoryRepository.createQueryBuilder('category');
  }
}
