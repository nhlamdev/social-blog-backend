import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AbstractEntity } from '@/shared/base';
import { ContentEntity } from '../content/content.entity';
import { MemberEntity } from '../member/member.entity';

@Entity('series')
export class SeriesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  description: string;

  @OneToMany(() => ContentEntity, (content) => content.series, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];

  @ManyToOne(() => MemberEntity, (member) => member.series, { nullable: false })
  created_by: MemberEntity;
}
