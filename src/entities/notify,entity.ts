import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from './abstract.entity';

@Entity('notify')
export class NotifyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'text', nullable: false })
  case: 'system' | 'action';
}
