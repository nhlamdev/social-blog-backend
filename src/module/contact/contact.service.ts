import { ContactEntity } from '@/database/entities';
import { IBaseService } from '@/shared/base/base.service';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ContactService implements IBaseService<ContactEntity> {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
  ) {}

  exist(options?: FindManyOptions<ContactEntity>): Promise<boolean> {
    return this.contactRepository.exist(options);
  }

  findOne(options?: FindOneOptions<ContactEntity>): Promise<ContactEntity> {
    return this.contactRepository.findOne(options);
  }

  findAll(options?: FindManyOptions<ContactEntity>): Promise<ContactEntity[]> {
    return this.contactRepository.find(options);
  }

  async findAllAndCount(
    options?: FindManyOptions<ContactEntity>,
  ): Promise<{ result: ContactEntity[]; count: number }> {
    const [result, count] = await this.contactRepository.findAndCount(options);

    return { result, count };
  }

  async builder(alias: string): Promise<SelectQueryBuilder<ContactEntity>> {
    return await this.contactRepository.createQueryBuilder(alias);
  }

  async count(options?: FindManyOptions<ContactEntity>): Promise<number> {
    return this.contactRepository.count(options);
  }

  async create(instance: DeepPartial<ContactEntity>): Promise<ContactEntity> {
    return await this.contactRepository.create(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    options?: QueryDeepPartialEntity<ContactEntity>,
  ) {
    return await this.contactRepository.update(criteria, options);
  }

  async softDelete?(criteria: TypeTypeOrmCriteria): Promise<UpdateResult> {
    return await this.contactRepository.softDelete(criteria);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.contactRepository.delete(criteria);
  }
}
