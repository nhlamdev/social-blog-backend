import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from '@/base';
import { ContentEntity } from '.';

@Entity('series')
export class SeriesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  summary: string;

  @Column({ type: 'text', nullable: true })
  created_by: string;

  @OneToMany(() => ContentEntity, (content) => content.series, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];
}
