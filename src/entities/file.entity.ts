import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToOne(() => ContentEntity, (content) => content.image)
  content: ContentEntity;
}
