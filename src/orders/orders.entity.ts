import { User } from '@user/users.entity';
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

import { BaseEntity } from '../common/base-entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatusEnum {
  INQUEUE = 0,
  PROCEED = 1,
  SUCCESS = 2,
  ERROR = 3,
  MANUAL = 4,
  WITHOUTPRICE = 5,
}

@Entity('orders')
export class Orders extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  recipientName?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  orderDate?: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  shipDate?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  carrierCode?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  carrierName?: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  amazonOrderId: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  shipAddress?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  shipCity?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  shipState?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  shipPostalCode?: string;

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.INQUEUE,
  })
  public status: OrderStatusEnum;

  @OneToMany(() => OrderItem, (v) => v.order, { cascade: true })
  items: OrderItem[];

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
