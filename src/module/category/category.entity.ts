import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from '@/shared/base';
import { ContentEntity } from '../content/content.entity';

@Entity('category')
export class CategoryEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  description: string;

  @OneToMany(() => ContentEntity, (content) => content.category, {
    onDelete: 'SET NULL',
  })
  contents: ContentEntity[];
}
