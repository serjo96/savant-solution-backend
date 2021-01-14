import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../common/base-entity';

@Entity('items-config-visibility')
export class ItemsColumnsVisibilityEntity extends BaseEntity {
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
  quantity: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  amazonSku: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  itemNumber: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  threshold: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  supplier: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  altSupplier: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  note: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  createdItemAt: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  status: boolean;
}
