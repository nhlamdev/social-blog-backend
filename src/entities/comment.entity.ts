import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ContentEntity, MemberEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('comment')
export class CommentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false, default: '' })
  text: string;

  @Column({ type: 'text', array: true, default: [], nullable: false })
  member_like: string[];

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

  @ManyToOne(() => MemberEntity, (member) => member.comments)
  created_by: MemberEntity;
}
