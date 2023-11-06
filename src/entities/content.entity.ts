import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity, CommentEntity, MemberEntity, SeriesEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('content')
export class ContentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'boolean', nullable: false })
  complete: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  case_allow: 'noly-me' | 'have-link' | 'public';

  @Column({ type: 'integer', nullable: false, default: 0 })
  count_view: number;

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  Evaluate: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  tags: string[];

  @Column({ type: 'text', array: true, default: [] })
  saved_by: string[];

  @OneToMany(() => CommentEntity, (tag) => tag.content, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.contents)
  category?: CategoryEntity;

  @ManyToOne(() => SeriesEntity, (content) => content.contents)
  series?: SeriesEntity;

  @ManyToOne(() => MemberEntity, (member) => member.contents)
  created_by: MemberEntity;
}
