import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from './abstract.entity';
import { MemberEntity } from './member.entity';

@Entity('notify')
export class NotifyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: false })
  from: MemberEntity;

  @Column({ type: 'boolean', default: false, nullable: false })
  seen: boolean;

  @Column({ type: 'text', nullable: false })
  to: MemberEntity;
}
