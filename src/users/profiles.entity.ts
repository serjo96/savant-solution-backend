import { Column, Entity, OneToOne } from 'typeorm';

import { BaseEntity } from '../common/base-entity';

import { User } from './users.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column({
    nullable: true,
  })
  public name: string;

  @Column({
    nullable: true,
  })
  public photoURL: string;

  @OneToOne(
      type => User,
      user => user.profile,
  ) // specify inverse side as a second parameter
  user: User;
}
