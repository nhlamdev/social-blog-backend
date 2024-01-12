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
import { IBaseService } from '@/shared/base/IBase.service';
import { MemberEntity } from './member.entity';

@Injectable()
export class MemberService implements IBaseService<MemberEntity> {
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
    const [result, count] = await this.memberRepository.findAndCount(options);

    return { result, count };
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
    criteria: TypeTypeOrmCriteria<MemberEntity>,
    options?: QueryDeepPartialEntity<MemberEntity>,
  ) {
    return await this.memberRepository.update(criteria, options);
  }

  async delete(criteria: TypeTypeOrmCriteria<MemberEntity>) {
    return await this.memberRepository.delete(criteria);
  }

  async builder() {
    return this.memberRepository.createQueryBuilder('member');
  }
}
