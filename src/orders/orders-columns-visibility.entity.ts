import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';

@Entity('orders-config-visibility')
export class OrdersColumnsVisibilityEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  orderId: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  itemId: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  supplier: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  recipientName: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  shipDate: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  carrierCode: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  carrierName: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  trackingNumber: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  note: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  createdOrderAt: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  status: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  amazonItemId: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  amazonOrderId: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  amazonSku: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  quantity: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  googleShipDate: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  googleTrackingNumber: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  googleShipMethod: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  googleAccountId: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  googleWebNumber: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  googleOrderId: boolean;
}
