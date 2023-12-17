import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ContentEntity, MemberEntity } from '.';
import { AbstractEntity } from '@/base';

@Entity('series')
export class SeriesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  summary: string;

  @ManyToOne(() => MemberEntity, (member) => member.series)
  created_by: MemberEntity;

  @OneToMany(() => ContentEntity, (content) => content.series, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];
}
