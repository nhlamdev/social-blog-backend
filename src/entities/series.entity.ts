import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ContentEntity, MemberEntity } from '.';

@Entity('series')
export class SeriesEntity {
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
