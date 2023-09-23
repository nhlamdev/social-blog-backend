import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CommentEntity, SessionEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('member')
export class MemberEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  provider_id: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  provider: 'google' | 'discord' | 'facebook' | 'github';

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
  image?: string;

  @OneToMany(() => SessionEntity, (session) => session.member)
  session: SessionEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.create_by)
  comments: CommentEntity[];
}
