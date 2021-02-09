import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { Orders } from './orders.entity';
import { GraingerItem } from '../grainger-items/grainger-items.entity';

export enum GraingerShipMethodEnum {
  EXPRESS = 1,
  NEXT_DAY = 2,
}

@Entity('order-items')
export class OrderItem extends BaseEntity {
  @Column({
    unique: true,
    type: 'varchar',
  })
  amazonItemId: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  amazonSku: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  amazonQuantity: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  amazonPrice: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  graingerPrice?: number;

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

  @ManyToOne(() => GraingerItem, (v) => v.orderItems, { eager: true })
  graingerItem: GraingerItem;

  @ManyToOne(() => Orders, (v) => v.items, { onDelete: 'CASCADE' })
  order: Orders;
}
