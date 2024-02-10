import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from '@/shared/base';
import { CommentEntity } from '../comment/comment.entity';
import { ContactEntity } from '../contact/contact.entity';
import { ContentEntity } from '../content/content.entity';
import { SeriesEntity } from '../series/series.entity';
import { SessionEntity } from '../session/session.entity';

@Entity('member')
export class MemberEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  email: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  role_author: boolean;

  @Column({ type: 'boolean', default: true, nullable: false })
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

  @OneToMany(() => ContentEntity, (content) => content.created_by)
  contents: ContentEntity[];

  @OneToMany(() => SeriesEntity, (series) => series.created_by)
  series: SeriesEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.created_by, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.created_by, {
    onDelete: 'CASCADE',
  })
  sessions: SessionEntity[];

  @OneToMany(() => ContactEntity, (contact) => contact.created_by)
  contacts: ContactEntity[];
}
