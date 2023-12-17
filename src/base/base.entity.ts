import { instanceToPlain } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false, select: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: false, select: false })
  delete_at: Date;

  @Generated('increment')
  @Column({ type: 'integer', nullable: false, select: false })
  @Index()
  index: number;

  toJSON() {
    return instanceToPlain(this);
  }
}
