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

  @OneToMany(() => CommentEntity, (comment) => comment.reply)
  comment_parent?: CommentEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.comment_parent)
  reply: CommentEntity[];

  @ManyToOne(() => ContentEntity, (Content) => Content.comments)
  content?: ContentEntity;

  @ManyToOne(() => MemberEntity, (member) => member.comments)
  create_by?: MemberEntity;
}
