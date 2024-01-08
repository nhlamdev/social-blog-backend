import { AbstractEntity } from '@/shared/base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberEntity } from './member.entity';
@Entity('contact')
export class ContactEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToOne(() => MemberEntity, (member) => member.contacts)
  created_by: MemberEntity;
}
