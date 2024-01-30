import { AbstractEntity } from '@/shared/base';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { FileEntity } from '../file/file.entity';
import { CategoryEntity } from '../category/category.entity';

@Entity('question_answer')
export class QAEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @ManyToOne(() => CategoryEntity, (category) => category.qa)
  category: CategoryEntity;

  @Column({ type: 'text', array: true, nullable: false })
  tags: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  member_up_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  member_down_vote: string[];

  @Column({ type: 'integer', nullable: false, default: 0 })
  count_view: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  verify: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  closed: boolean;

  @ManyToOne(() => QAEntity, (qa) => qa.answers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  question: QAEntity | null;

  @OneToMany(() => QAEntity, (qa) => qa.question, {
    onDelete: 'CASCADE',
  })
  answers: QAEntity[];

  @OneToMany(() => FileEntity, (file) => file.qa, {
    onDelete: 'CASCADE',
  })
  files: FileEntity[];

  @ManyToOne(() => MemberEntity)
  created_by: MemberEntity;
}
