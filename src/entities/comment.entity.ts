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

  @Column({ type: 'text', nullable: false })
  text: string;

  @OneToMany(() => CommentEntity, (comment) => comment.replys)
  comment_parent?: CommentEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.comment_parent)
  replys: CommentEntity[];

  @ManyToOne(() => ContentEntity, (Content) => Content.comments)
  content: ContentEntity;

  @ManyToOne(() => MemberEntity, (member) => member.comments)
  create_by: MemberEntity;
}
