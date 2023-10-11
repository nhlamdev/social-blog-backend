import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MemberEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('member')
export class NotifyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @ManyToOne(() => MemberEntity)
  member: string;
}
