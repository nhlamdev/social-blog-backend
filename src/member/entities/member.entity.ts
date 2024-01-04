import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from '@/shared/base';

@Entity('member')
export class MemberEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  email: string;

  @Column({ type: 'boolean', default: true })
  role_author: boolean;

  @Column({ type: 'boolean', default: true })
  role_comment: boolean;

  @Column({ type: 'boolean', default: false })
  role_owner: boolean;

  @Column({
    type: 'text',
    default: 'member-default.png.webp',
    nullable: false,
  })
  image: string;

  @Column({ type: 'text', array: true, default: [], nullable: false })
  follow_by: string[];

  // @BeforeInsert()
  // async beforeInsert() {
  //   this.image = this.image;
  // }
}
