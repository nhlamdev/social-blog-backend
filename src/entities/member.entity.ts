import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CommentEntity, ContentEntity, SeriesEntity, SessionEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('member')
export class MemberEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'member' })
  role: 'member' | 'writer' | 'developer' | 'owner';

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
