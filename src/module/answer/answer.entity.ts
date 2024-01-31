import { AbstractEntity } from '@/shared/base';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { QuestionEntity } from '../question/question.entity';

@Entity('answer')
export class AnswerEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'json', array: true, nullable: false, default: [] })
  member_up_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  member_down_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  files: string[];

  @Column({ type: 'boolean', nullable: false, default: true })
  verify: boolean;

  @ManyToOne(() => QuestionEntity, (question) => question.answers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  question: QuestionEntity;

  @ManyToOne(() => AnswerEntity, (answer) => answer.replies, {
    onDelete: 'CASCADE',
  })
  answer_parent: AnswerEntity;

  @OneToMany(() => AnswerEntity, (answer) => answer.answer_parent, {
    onDelete: 'CASCADE',
  })
  replies: AnswerEntity[];

  @ManyToOne(() => MemberEntity, { nullable: false })
  created_by: MemberEntity;
}
