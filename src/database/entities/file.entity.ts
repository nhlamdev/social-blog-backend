import { MemberEntity } from '@/database/entities';
import { AbstractEntity } from '@/shared/base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('file')
export class FileEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  originalName: string;

  @Column({ type: 'text', nullable: false })
  fileName: string;

  @Column({ type: 'text', nullable: false })
  mimeType: string;

  @Column({ type: 'integer', nullable: false })
  size: number;

  @ManyToOne(() => MemberEntity, (member) => member.files)
  created_by: MemberEntity;
}
