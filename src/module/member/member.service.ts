import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { MemberEntity } from '../../database/entities';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  async findOne(options?: FindOneOptions<MemberEntity>) {
    return await this.memberRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<MemberEntity>) {
    return await this.memberRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<MemberEntity>) {
    return await this.memberRepository.findAndCount(options);
  }

  async exist(options?: FindManyOptions<MemberEntity>) {
    return this.memberRepository.exist(options);
  }

  async count(options?: FindManyOptions<MemberEntity>) {
    return this.memberRepository.count(options);
  }

  async create(instance: DeepPartial<MemberEntity>) {
    return await this.memberRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    options?: QueryDeepPartialEntity<MemberEntity>,
  ) {
    return await this.memberRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.memberRepository.delete(criteria);
  }

  async builder() {
    return this.memberRepository.createQueryBuilder('member');
  }
}
