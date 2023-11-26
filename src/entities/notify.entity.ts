import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from './abstract.entity';

@Entity('notify')
export class NotifyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'text', nullable: false })
  from: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  hidden: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  seen: boolean;

  @Column({ type: 'text', nullable: false })
  to: string;

  @Column({ type: 'text', nullable: false })
  type: 'create-content' | 'create-content' | 'create-reply';
}
