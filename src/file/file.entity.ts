import { MemberEntity } from '@/database/entities';
import { AbstractEntity } from '@/shared/base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('file')
export class FileEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: true })
  originalName: string;

  @Column({ type: 'text', nullable: true })
  fileName: string;

  @Column({ type: 'text', nullable: true })
  mimeType: string;

  @Column({ type: 'integer', nullable: true })
  size: number;

  @ManyToOne(() => MemberEntity, (member) => member.files)
  created_by: MemberEntity;
}
