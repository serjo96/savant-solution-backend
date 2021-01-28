import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { Orders } from './orders.entity';
import { Item } from '../items/items.entity';

export enum GraingerShipMethodEnum {
  EXPRESS = 1,
  NEXT_DAY = 2,
}

@Entity('order-items')
export class OrderItem extends BaseEntity {
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
  note?: string;

  @ManyToOne(() => Item, (v) => v.orderItems, { eager: true })
  item: Item;

  @ManyToOne(() => Orders, (v) => v.items)
  order: Orders;
}
