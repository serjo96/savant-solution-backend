import { User } from '@user/users.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid4 } from 'uuid';

import { BaseEntity } from '../common/base-entity';
import generateId from '../utils/idGenerator';
export enum StatusEnum {
  MANUAL = 3,
  PROCEED = 2,
  SUCCESS = 1,
  CANCEL = 0,
}

export enum GraingerShipMethodEnum {
  EXPRESS = 1,
  NEXT_DAY = 2,
}

@Entity('orders')
export class Orders extends BaseEntity {
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
  itemId: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  quantity: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  recipientName?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: 'Grainger',
  })
  supplier: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note?: string;

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
    nullable: true,
  })
  trackingNumber?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  amazonSku?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  amazonItemId?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  amazonOrderId?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  graingerShipDate?: Date;

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
  graingerAccountId?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  graingerWebNumber?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  graingerOrderId?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstShipAddress?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  secondShipAddress?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thirdShipAddress?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  shipСity?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  shipState?: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  shipPostalCode?: number;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.PROCEED,
  })
  public status: StatusEnum;

  @ManyToOne((type) => User, (user) => user.orders, { eager: true })
  public user: User;

  @BeforeInsert()
  public baseEntityOnCreate(): void {
    if (!this.id) {
      this.id = uuid4();
    }
    if (!this.amazonOrderId) {
      this.amazonOrderId = generateId();
    }
  }
}
