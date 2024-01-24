import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotificationEntity } from './notification.entity';
import { IBaseRepository } from '@/shared/base/IBase.repository';

@Injectable()
export class NotificationRepository
  implements IBaseRepository<NotificationEntity>
{
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
    const [result, count] = await this.notifyRepository.findAndCount(options);

    return { result, count };
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
    criteria: TypeTypeOrmCriteria<NotificationEntity>,
    options?: QueryDeepPartialEntity<NotificationEntity>,
  ) {
    return await this.notifyRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria<NotificationEntity>) {
    return await this.notifyRepository.delete(criteria);
  }

  async builder() {
    return this.notifyRepository.createQueryBuilder('member');
  }
}
