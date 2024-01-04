import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from '@/shared/base';

@Entity('QA')
export class QAEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  image: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  tags: string[];

  @Column({ type: 'text', nullable: false })
  created_by: string;

  @ManyToOne(() => QAEntity, (question) => question.answers)
  question: QAEntity;

  @OneToMany(() => QAEntity, (answers) => answers.question, {
    onDelete: 'CASCADE',
  })
  answers: QAEntity[];
}
