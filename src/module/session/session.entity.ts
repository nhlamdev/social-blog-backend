import { AbstractEntity } from '@/shared/base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('session')
export class SessionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'string', nullable: false })
  token_key: string;

  @Column({ type: 'text', nullable: false })
  provider_id: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  provider: 'google' | 'discord' | 'github';

  @Column({ type: 'text', default: 'unknown', nullable: false })
  os: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  device: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  browser: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  ip: string;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Time session expires in seconds',
  })
  expires_in: number;

  @ManyToOne(() => MemberEntity, (member) => member.sessions)
  created_by: MemberEntity;
}
