import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity, CommentEntity, FileEntity, SeriesEntity } from '.';
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

  @OneToMany(() => FileEntity, (file) => file.content, { cascade: true })
  @JoinColumn()
  images: FileEntity[];

  @OneToMany(() => CommentEntity, (tag) => tag.content, { cascade: true })
  comments: CommentEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.contents)
  category?: CategoryEntity;

  @ManyToOne(() => SeriesEntity, (content) => content.contents)
  series?: SeriesEntity;
}
