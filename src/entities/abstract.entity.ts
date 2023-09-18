import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamp' })
  delete_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // @Generated('increment')
  // @Column({ type: 'integer', nullable: false, default: 0 })
  // index: number;
}
