import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString, MaxLength,
} from 'class-validator';

import { OrderStatusEnum } from '../orders.entity';
import { Exclude } from 'class-transformer';
import { GraingerShipMethodEnum } from '../../items/item.entity';
import { GetItemDto } from '../../items/dto/get-item.dto';
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
