import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString, MaxLength,
} from 'class-validator';

import { OrderStatusEnum } from '../orders.entity';
import { Exclude } from 'class-transformer';
import { GraingerShipMethodEnum } from '../order-item.entity';
import { GetOrderItemDto } from './get-order-item.dto';
import { EditOrderDto } from './editOrder.dto';

export class GetOrderDto extends EditOrderDto {
  @IsString()
  id: string;

  @Exclude()
  user: any;

  @Exclude()
  createdAt: any;

  @Exclude()
  updatedAt: any;

  @Exclude()
  deletedAt: any;
}
