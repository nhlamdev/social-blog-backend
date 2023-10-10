import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity('role')
export class RoleEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'boolean', default: true })
  author: boolean;

  @Column({ type: 'boolean', default: true })
  comment: boolean;

  @Column({ type: 'boolean', default: false })
  owner: boolean;
}
