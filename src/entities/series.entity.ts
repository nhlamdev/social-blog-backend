import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ContentEntity } from '.';
import { AbstractEntity } from './abstract.entity';

@Entity('series')
export class SeriesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  summary: string;

  @OneToMany(() => ContentEntity, (content) => content.series)
  contents: ContentEntity[];
}
