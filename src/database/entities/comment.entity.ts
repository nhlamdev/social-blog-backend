import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AbstractEntity } from '@/shared/base';
import { ContentEntity } from '@/database/entities';

@Entity('comment')
export class CommentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false, default: '' })
  text: string;

  @Column({ type: 'text', array: true, default: [], nullable: false })
  member_like: string[];

  @Column({ type: 'text', nullable: true })
  created_by: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  comment_parent: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.comment_parent, {
    onDelete: 'CASCADE',
  })
  replies: CommentEntity[];

  @ManyToOne(() => ContentEntity, (Content) => Content.comments)
  content?: ContentEntity;
}