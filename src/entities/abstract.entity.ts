import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false, select: false })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: false, select: false })
  delete_at: Date;

  @Generated('increment')
  @Column({ type: 'integer', nullable: false })
  index: number;
}
