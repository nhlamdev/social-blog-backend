import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ContentEntity } from '.';

@Entity('file')
export class FileEntity extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @ManyToOne(() => ContentEntity, (content) => content.images)
  content: ContentEntity;
}
