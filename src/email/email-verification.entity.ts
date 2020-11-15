import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';

@Entity('email-verification')
export class EmailVerificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column()
  public emailToken: string;

  @Column({
    type: 'timestamptz',
  })
  public timestamp: Date;
}
