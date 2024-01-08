import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { NotificationEntity } from '@/database/entities';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notifyRepository: Repository<NotificationEntity>,
  ) {}

  async findOne(options?: FindOneOptions<NotificationEntity>) {
    return await this.notifyRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<NotificationEntity>) {
    return this.notifyRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<NotificationEntity>) {
    return this.notifyRepository.findAndCount(options);
  }

  async exist(options?: FindManyOptions<NotificationEntity>) {
    return this.notifyRepository.exist(options);
  }

  async count(options?: FindManyOptions<NotificationEntity>) {
    return this.notifyRepository.count(options);
  }

  async create(instance: DeepPartial<NotificationEntity>) {
    return await this.notifyRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    options?: QueryDeepPartialEntity<NotificationEntity>,
  ) {
    return await this.notifyRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.notifyRepository.delete(criteria);
  }

  async builder() {
    return this.notifyRepository.createQueryBuilder('member');
  }
}
