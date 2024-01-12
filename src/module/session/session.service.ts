import { IBaseService } from '@/shared/base/IBase.service';
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
import { SessionEntity } from './session.entity';
import { TokenService } from '@/auth/token/token.service';

@Injectable()
export class SessionService implements IBaseService<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    private seriesRepository: Repository<SessionEntity>,
    private tokenService: TokenService,
  ) {}

  async findOne(options?: FindOneOptions<SessionEntity>) {
    return await this.seriesRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<SessionEntity>) {
    return await this.seriesRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<SessionEntity>) {
    const [result, count] = await this.seriesRepository.findAndCount(options);

    return { result, count };
  }

  async exist(options?: FindManyOptions<SessionEntity>) {
    return this.seriesRepository.exist(options);
  }

  async count(options?: FindManyOptions<SessionEntity>) {
    return this.seriesRepository.count(options);
  }

  async create(instance: DeepPartial<SessionEntity>) {
    return await this.seriesRepository.save(instance);
  }

  async update(
    criteria: TypeTypeOrmCriteria<SessionEntity>,
    payload: QueryDeepPartialEntity<SessionEntity>,
  ) {
    return await this.seriesRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria<SessionEntity>) {
    return await this.seriesRepository.delete(criteria);
  }

  async softDelete(criteria: TypeTypeOrmCriteria<SessionEntity>) {
    return await this.seriesRepository.softDelete(criteria);
  }

  async builder() {
    return await this.seriesRepository.createQueryBuilder('series');
  }
}
