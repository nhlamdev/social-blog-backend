import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ContentEntity, MemberEntity } from '.';
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

  @ManyToMany(() => MemberEntity, (member) => member.favorites)
  favorites_by: MemberEntity[];
}
