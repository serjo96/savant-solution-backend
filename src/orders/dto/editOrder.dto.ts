import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { GetOrderItemDto } from './get-order-item.dto';
import { OrderStatusEnum } from '../orders.entity';

export class EditOrderDto {
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @MaxLength(256)
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  shipDate?: Date;

  @IsDateString()
  @IsOptional()
  orderDate?: Date;

  @IsString()
  @IsOptional()
  carrierCode?: string;

  @IsString()
  @IsOptional()
  carrierName?: string;

  @IsString()
  amazonOrderId: string;

  @IsString()
  @IsOptional()
  graingerAccountId?: string;
  @IsString()
  @IsOptional()
  shipAddress?: string;
  @IsString()
  @IsOptional()
  shipCity?: string;
  @IsString()
  @IsOptional()
  shipState?: string;
  @IsString()
  @IsOptional()
  shipPostalCode?: string;

  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @IsOptional()
  items?: GetOrderItemDto[];
}
