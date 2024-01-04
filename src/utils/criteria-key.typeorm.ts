import { MemberEntity } from '@/member/entities';
import { FindOptionsWhere, ObjectId } from 'typeorm';

export type TypeTypeOrmCriteria =
  | string
  | number
  | Date
  | ObjectId
  | FindOptionsWhere<MemberEntity>
  | string[]
  | number[]
  | Date[]
  | ObjectId[];
