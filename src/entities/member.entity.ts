import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  CommentEntity,
  ContentEntity,
  NotifyEntity,
  SeriesEntity,
  SessionEntity,
} from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('member')
export class MemberEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  email: string;

  @Column({ type: 'boolean', default: true })
  role_author: boolean;

  @Column({ type: 'boolean', default: true })
  role_comment: boolean;

  @Column({ type: 'boolean', default: false })
  role_owner: boolean;

  @Column({
    type: 'text',
    default:
      'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
    nullable: false,
  })
  image: string;

  @OneToMany(() => SessionEntity, (session) => session.member, {
    onDelete: 'CASCADE',
  })
  session: SessionEntity[];

  @OneToMany(() => ContentEntity, (content) => content.created_by)
  contents: ContentEntity[];

  @OneToMany(() => ContentEntity, (content) => content.created_by)
  save_contents: ContentEntity[];

  @OneToMany(() => SeriesEntity, (series) => series.created_by)
  series: SeriesEntity[];

  @OneToMany(() => NotifyEntity, (notify) => notify.member)
  notifies: NotifyEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.created_by, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @OneToMany(() => MemberEntity, (member) => member.follow, {
    onDelete: 'CASCADE',
  })
  followed_by: MemberEntity[];

  @ManyToOne(() => MemberEntity, (comment) => comment.followed_by, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  follow?: MemberEntity | null;
}
