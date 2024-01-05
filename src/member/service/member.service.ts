import { TypeTypeOrmCriteria } from '@/utils/criteria-key.typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { MemberEntity } from '../entities';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  async findAll(options?: FindManyOptions<MemberEntity>) {
    return await this.memberRepository.find(options);
  }

  async findOne(options?: FindOneOptions<MemberEntity>) {
    return await this.memberRepository.findOne(options);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    options?: QueryDeepPartialEntity<MemberEntity>,
  ) {
    return await this.memberRepository.update(criteria, options);
  }

  async builder() {
    return this.memberRepository.createQueryBuilder('member');
  }
}
