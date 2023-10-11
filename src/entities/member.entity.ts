import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  CommentEntity,
  ContentEntity,
  RoleEntity,
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

  @Column({
    type: 'text',
    default:
      'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
    nullable: false,
  })
  image: string;

  @OneToOne(() => RoleEntity, (role) => role.member, {
    onDelete: 'CASCADE',
  })
  role: RoleEntity;

  @OneToMany(() => SessionEntity, (session) => session.member, {
    onDelete: 'CASCADE',
  })
  session: SessionEntity[];

  @OneToMany(() => ContentEntity, (content) => content.created_by)
  contents: ContentEntity[];

  @OneToMany(() => SeriesEntity, (series) => series.created_by)
  series: SeriesEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.created_by, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];
}
