import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { MemberEntity } from '.';

@Entity('session')
export class SessionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  os: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  device: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  browser: string;

  @Column({ type: 'text', default: 'unknown', nullable: false })
  ip: string;

  @Column({ type: 'text', default: 'member', nullable: false })
  role: 'member' | 'owner';

  @ManyToOne(() => MemberEntity, (content) => content.session)
  member: MemberEntity;
}
