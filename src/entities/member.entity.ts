import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CommentEntity, ContentEntity, SeriesEntity, SessionEntity } from '.';
import { AbstractEntity } from '@/base';

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
    default: 'member-default.png.webp',
    nullable: false,
  })
  image: string;

  @Column({ type: 'text', array: true, default: [], nullable: false })
  follow_by: string[];

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

  // @BeforeInsert()
  // async beforeInsert() {
  //   this.image = this.image;
  // }
}
