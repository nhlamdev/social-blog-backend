import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { AbstractEntity } from '@/shared/base';
import { ContentEntity } from '.';

@Entity('series')
export class SeriesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true })
  created_by: string;

  @OneToMany(() => ContentEntity, (content) => content.series, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];
}
