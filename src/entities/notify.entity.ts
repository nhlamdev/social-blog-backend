import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MemberEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('notify')
export class NotifyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @ManyToOne(() => MemberEntity, (member) => member.notifies)
  member: MemberEntity;
}
