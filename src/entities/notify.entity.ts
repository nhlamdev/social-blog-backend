import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from './abstract.entity';

@Entity('notify')
export class NotifyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  from: string | null;

  @Column({ type: 'boolean', default: false, nullable: false })
  seen: boolean;

  @Column({ type: 'text', nullable: false })
  to: string;

  @Column({ type: 'text', nullable: true })
  url: string | null;
}
