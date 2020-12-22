import * as bcrypt from 'bcrypt';
import {
  BeforeInsert, BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';

export enum RolesEnum {
  GUEST = 0,
  USER = 1,
  MODERATOR = 2,
  ADMIN = 3,
}

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    nullable: true,
  })
  public name?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({
    type: 'enum',
    enum: RolesEnum,
    array: true,
    default: [RolesEnum.USER],
  })
  public roles: RolesEnum;
}
