import { AbstractEntity } from '@/shared/base';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentEntity } from '../comment/comment.entity';
import { CategoryEntity } from '../category/category.entity';
import { SeriesEntity } from '../series/series.entity';
import { MemberEntity } from '../member/member.entity';

@Entity('content')
export class ContentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  complete: boolean;

  @Column({ type: 'boolean', nullable: false, default: true })
  public: boolean;

  @Column({ type: 'text', array: true, default: [] })
  watches: string[];

  @Column({ type: 'integer', nullable: false, default: 0 })
  count_view: number;

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  member_up_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  member_down_vote: string[];

  @Column({ type: 'text', array: true, nullable: false, default: [] })
  tags: string[];

  @Column({ type: 'text', array: true, default: [] })
  bookmark_by: string[];

  @OneToMany(() => CommentEntity, (tag) => tag.content, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.contents)
  category?: CategoryEntity;

  @ManyToOne(() => SeriesEntity, (content) => content.contents)
  series?: SeriesEntity;

  @ManyToOne(() => MemberEntity, (member) => member.contents, {
    nullable: false,
  })
  created_by: MemberEntity;
}
