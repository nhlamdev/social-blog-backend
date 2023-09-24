import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ContentEntity, FileEntity } from '.';

@Entity('category')
export class CategoryEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  summary: string;

  @OneToOne(() => FileEntity, { nullable: true, cascade: true })
  @JoinColumn()
  image?: FileEntity;

  @OneToMany(() => ContentEntity, (content) => content.category, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];
}
