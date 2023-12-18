import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from '@/base';
import { MemberEntity } from '.';
@Entity('contact')
export class ContactEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToOne(() => MemberEntity, (member) => member.contacts)
  create_by: string;
}
