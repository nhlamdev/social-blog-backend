import { AbstractEntity } from '@/shared/base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('contact')
export class ContactEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: false })
  created_by: string;
}
