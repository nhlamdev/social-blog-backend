import { AbstractEntity } from '@/shared/base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification')
export class NotificationEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: false })
  from: string | null;

  @Column({ type: 'text', nullable: false })
  to: string | null;

  @Column({ type: 'boolean', default: false, nullable: false })
  seen: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  isAll: boolean;

  @Column({ type: 'text', nullable: true })
  url: string | null;
}
