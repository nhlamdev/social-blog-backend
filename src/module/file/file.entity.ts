import { AbstractEntity } from '@/shared/base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { QAEntity } from '../QA/QA.entity';

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

  @Column({ type: 'json', nullable: true })
  shape?: { width: number; height: number };

  @Column({ type: 'boolean', nullable: false })
  size: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  resized: boolean;

  @ManyToOne(() => QAEntity, (member) => member.files)
  qa: QAEntity;

  @ManyToOne(() => MemberEntity, (member) => member.files)
  created_by: MemberEntity;
}
