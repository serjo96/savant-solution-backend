import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

import { BaseEntity } from '../common/base-entity';
import generateId from '../utils/idGenerator';
export enum StatusEnum {
  MANUAL = 3,
  PROCEED = 2,
  SUCCESS = 1,
  CANCEL = 0,
}

export enum GoogleShipMethodEnum {
  EXPRESS = 1,
  NEXT_DAY = 2,
}

@Entity('orders')
export class Orders extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  googleShipDate?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  googleTrackingNumber?: string;

  @Column({
    type: 'enum',
    enum: GoogleShipMethodEnum,
    nullable: true,
  })
  googleShipMethod?: GoogleShipMethodEnum;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  googleAccountId?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  googleWebNumber?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  googleOrderId?: string;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.PROCEED,
  })
  public status: StatusEnum;

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
