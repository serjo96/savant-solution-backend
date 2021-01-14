import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { ItemsColumnsVisibilityEntity } from '../items/items-columns-visibility.entity';
import { OrdersColumnsVisibilityEntity } from '../orders/orders-columns-visibility.entity';

@Entity('user-settings')
export class UserSettings extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => OrdersColumnsVisibilityEntity, { eager: true, cascade: true })
  @JoinColumn()
  ordersTable: OrdersColumnsVisibilityEntity;

  @OneToOne(() => ItemsColumnsVisibilityEntity, { eager: true, cascade: true })
  @JoinColumn()
  itemsTable: ItemsColumnsVisibilityEntity;

  @BeforeInsert()
  createInitData() {
    this.ordersTable = new OrdersColumnsVisibilityEntity();
    this.itemsTable = new ItemsColumnsVisibilityEntity();
  }
}
