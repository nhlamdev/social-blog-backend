import { FindOptionsWhere, ObjectId } from 'typeorm';

export type TypeTypeOrmCriteria<Entity> =
  | string
  | number
  | Date
  | ObjectId
  | FindOptionsWhere<Entity>
  | string[]
  | number[]
  | Date[]
  | ObjectId[];
