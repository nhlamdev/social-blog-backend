import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { MemberEntity } from './member.entity';

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

  @OneToOne(() => MemberEntity, (member) => member.role)
  member: MemberEntity;
}
