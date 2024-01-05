import { AbstractEntity } from '@/shared/base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('session')
export class SessionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  provider_id: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  provider: 'google' | 'discord' | 'facebook' | 'github';

  @Column({ type: 'text', default: 'unknown', nullable: false })
  os: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  device: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  browser: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  ip: string;

  @Column({ type: 'text', nullable: true })
  age: string;

  @Column({ type: 'text', nullable: true })
  created_by: string;
}