import { AbstractEntity } from '@/shared/base';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswerEntity } from '../answer/answer.entity';
import { CategoryEntity } from '../category/category.entity';
import { MemberEntity } from '../member/member.entity';

@Entity('question')
export class QuestionEntity extends AbstractEntity {
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

  @Column({ type: 'json', array: true, nullable: false, default: [] })
  member_up_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  member_down_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  files: string[];

  @Column({ type: 'integer', nullable: false, default: 0 })
  count_view: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  closed: boolean;

  @OneToMany(() => AnswerEntity, (qa) => qa.question, {
    onDelete: 'CASCADE',
  })
  answers: AnswerEntity[];

  @ManyToOne(() => MemberEntity)
  created_by: MemberEntity;
}
