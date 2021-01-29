import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../items/items.entity';

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

  @OneToMany(() => Item, (v) => v.graingerAccount)
  items: Item[];
}
