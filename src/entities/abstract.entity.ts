import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamp', nullable: false })
  delete_at: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Generated('increment')
  @Column({ type: 'integer', nullable: false })
  index: number;
}
