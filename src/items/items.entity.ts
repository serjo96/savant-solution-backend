import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';
import { OrderItem } from '../orders/order-item.entity';
import { User } from '@user/users.entity';

export enum ItemStatusEnum {
  ACTIVE = 1,
  INACTIVE = 0,
}

@Entity('items')
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  amazonSku: string;

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

  @ManyToOne(() => OrderItem, (v) => v.item)
  orderItems: OrderItem[];

  @ManyToOne(() => User, (user) => user.items, { eager: true })
  user: User;
}
