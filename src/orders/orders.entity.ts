import { User } from '@user/users.entity';
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

import { BaseEntity } from '../common/base-entity';
import { Items } from '../items/item.entity';

export enum OrderStatusEnum {
  MANUAL = 3,
  PROCEED = 2,
  SUCCESS = 1,
  CANCEL = 0,
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
    type: 'date',
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
    default: OrderStatusEnum.PROCEED,
  })
  public status: OrderStatusEnum;

  @OneToMany(() => Items, (v) => v.order, { cascade: true })
  items: Items[];

  @ManyToOne(() => User, (user) => user.orders, {eager: true})
  public user: User;

  @BeforeInsert()
  public baseEntityOnCreate(): void {
    if (!this.id) {
      this.id = uuid4();
    }
  }
}
