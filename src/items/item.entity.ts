import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';
import { Orders } from '../orders/orders.entity';
import { User } from '@user/users.entity';

export enum ItemStatusEnum {
  ACTIVE = 1,
  INACTIVE = 0,
}

export enum GraingerShipMethodEnum {
  EXPRESS = 1,
  NEXT_DAY = 2,
}

@Entity('items')
export class Items extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    type: 'varchar',
  })
  amazonItemId: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  amazonQuantity: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  amazonSku: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  graingerTrackingNumber?: string;

  @Column({
    type: 'enum',
    enum: GraingerShipMethodEnum,
    nullable: true,
  })
  graingerShipMethod?: GraingerShipMethodEnum;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  graingerOrderId?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  graingerShipDate?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  graingerWebNumber?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  graingerItemNumber: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  graingerPackQuantity?: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  graingerThreshold?: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'enum',
    enum: ItemStatusEnum,
    default: ItemStatusEnum.ACTIVE,
  })
  public status: ItemStatusEnum;

  @ManyToOne(() => GraingerAccount, (v) => v.items, {
    nullable: true,
    eager: true,
  })
  graingerAccount: GraingerAccount;

  @ManyToOne(() => Orders, (v) => v.items)
  order: Orders;

  @ManyToOne(() => User, (user) => user.orders, {eager: true})
  user: User;
}
