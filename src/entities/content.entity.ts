import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import {
  FileEntity,
  CategoryEntity,
  SeriesEntity,
  CommentEntity,
  MemberEntity,
} from '.';

@Entity('content')
export class ContentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'boolean', nullable: false })
  complete: boolean;

  @Column({ type: 'text', array: true })
  tags: string[];

  @OneToOne(() => FileEntity, (file) => file.content)
  @JoinColumn()
  image: FileEntity;

  // @OneToMany(() => NotifyEntity, (tag) => tag.content, { cascade: true })
  // notifys: NotifyEntity[];

  @OneToMany(() => CommentEntity, (tag) => tag.content, { cascade: true })
  comments: CommentEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.contents)
  category?: CategoryEntity;

  @ManyToOne(() => SeriesEntity, (content) => content.contents)
  series?: SeriesEntity;

  @ManyToMany(() => MemberEntity, (member) => member.favorites)
  favorites_by: MemberEntity[];

  @ManyToMany(() => MemberEntity, (member) => member.notify_contents)
  notify_for: MemberEntity[];
}
