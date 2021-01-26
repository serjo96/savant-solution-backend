import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import generateId from '../utils/idGenerator';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';

export enum StatusEnum {
  ACTIVE = 1,
  INACTIVE = 0,
}

@Entity('items')
export class Items extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  @Index()
  public userId: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  itemNumber: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  threshold?: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  amazonSku: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  altSupplier?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE,
  })
  public status: StatusEnum;

  @ManyToOne(() => GraingerAccount, (v) => v.items, { nullable: true })
  graingerAccount: GraingerAccount;
}
