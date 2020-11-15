import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';

import { Profile } from './profiles.entity';

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

  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({
    type: 'enum',
    enum: RolesEnum,
    array: true,
    default: [RolesEnum.USER],
  })
  public roles: RolesEnum;

  @Column({
    nullable: true,
    default: false,
  })
  public confirmed: boolean;

  @OneToOne((type) => Profile, (profile) => profile.user, {
    eager: true,
  })
  profile: Profile;
}
