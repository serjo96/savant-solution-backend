import { UserSettings } from '@user/user-settings.entity';
import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { Orders } from '../orders/orders.entity';

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
    unique: true,
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

  @OneToMany(() => Orders, (order) => order.user)
  public orders: Orders[];

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  public roles: RolesEnum;

  @OneToOne(() => UserSettings, { eager: true, cascade: true })
  @JoinColumn()
  settings: UserSettings;
}
