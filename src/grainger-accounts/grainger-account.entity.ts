import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GraingerItem } from '../grainger-items/grainger-items.entity';

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

  @OneToMany(() => GraingerItem, (v) => v.graingerAccount)
  items: GraingerItem[];
}
