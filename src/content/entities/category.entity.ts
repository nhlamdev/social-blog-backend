import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ContentEntity } from '.';
import { AbstractEntity } from '@/shared/base';

@Entity('category')
export class CategoryEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  summary: string;

  @OneToMany(() => ContentEntity, (content) => content.category, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];
}
