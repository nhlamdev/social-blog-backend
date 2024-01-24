import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { TypeTypeOrmCriteria } from '../utils/criteria-key.typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseRepository<Entity> {
  findOne(options?: FindOneOptions<Entity>): Promise<Entity>;
  findAll(options?: FindManyOptions<Entity>): Promise<Entity[]>;
  findAllAndCount(
    options?: FindManyOptions<Entity>,
  ): Promise<{ result: Entity[]; count: number }>;
  exist(options?: FindManyOptions<Entity>): Promise<boolean>;
  count(options?: FindManyOptions<Entity>): Promise<number>;
  create(instance: DeepPartial<Entity>): Promise<Entity>;
  update(
    criteria: TypeTypeOrmCriteria<Entity>,
    payload: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult>;
  delete(criteria: TypeTypeOrmCriteria<Entity>): Promise<DeleteResult>;
  softDelete?(criteria: TypeTypeOrmCriteria<Entity>): Promise<UpdateResult>;
  builder(alias: string): Promise<SelectQueryBuilder<Entity>>;
}
