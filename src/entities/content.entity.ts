import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity, CommentEntity, MemberEntity, SeriesEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('content')
export class ContentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'boolean', nullable: false })
  draft: boolean;

  @Column({ type: 'boolean', nullable: false })
  complete: boolean;

  @Column({ type: 'integer', nullable: false, default: 0 })
  count_view: number;

  @Column({ type: 'text', array: true })
  tags: string[];

  // @OneToOne(() => FileEntity, { nullable: true, onDelete: 'CASCADE' })
  // @JoinColumn()
  // image?: FileEntity;

  @OneToMany(() => CommentEntity, (tag) => tag.content, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.contents)
  category?: CategoryEntity;

  @ManyToOne(() => SeriesEntity, (content) => content.contents)
  series?: SeriesEntity;

  @ManyToOne(() => MemberEntity, (member) => member.contents)
  created_by: MemberEntity;
}
