import { AbstractEntity } from '@/shared/base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('storage')
export class StorageEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: true })
  originalName: string;

  @Column({ type: 'text', nullable: true })
  encoding: string;

  @Column({ type: 'text', nullable: true })
  mimetype: string;

  @Column({ type: 'text', nullable: true })
  filename: string;

  @Column({ type: 'text', nullable: true })
  size: string;

  @Column({ type: 'text', nullable: true })
  created_by: string;
}
