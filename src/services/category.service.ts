import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CategoryEntity } from '@/database/entities';
import { CategoryDto } from '../model';
import { TypeTypeOrmCriteria } from '@/utils/criteria-key.typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
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
