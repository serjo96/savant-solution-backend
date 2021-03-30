import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { ColumnNumericTransformer } from '../common/transforms/numeric';
import { Orders } from './orders.entity';
import { GraingerItem } from '../grainger-items/grainger-items.entity';
import { AIGraingerOrderError } from '../ai/dto/get-grainger-order';

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
    transformer: new ColumnNumericTransformer(),
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

  @Column({
    type: 'enum',
    enum: AIGraingerOrderError,
    nullable: true,
  })
  error?: AIGraingerOrderError;

  @ManyToOne(() => GraingerItem, (v) => v.orderItems, { eager: true })
  graingerItem: GraingerItem;

  @ManyToOne(() => Orders, (v) => v.items, { onDelete: 'CASCADE' })
  order: Orders;
}
