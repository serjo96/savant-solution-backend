import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Items } from '../items/item.entity';

@Entity('grainger-account')
export class GraingerAccount extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @Column({
    nullable: false,
  })
  public name: string;

  @OneToMany(() => Items, (v) => v.graingerAccount)
  items: Items[];
}
