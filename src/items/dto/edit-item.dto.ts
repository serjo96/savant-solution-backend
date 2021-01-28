import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString, Max, MaxLength, Min,
} from 'class-validator';

import { GraingerShipMethodEnum, ItemStatusEnum } from '../item.entity';
import { GraingerAccount } from '../../grainger-accounts/grainger-account.entity';
import { Orders } from '../../orders/orders.entity';
import { GetOrderDto } from '../../orders/dto/get-order.dto';
import { Exclude } from 'class-transformer';

export class EditItemDto {
  @IsOptional()
  @IsString()
  graingerItemNumber?: string;

  @IsNotEmpty()
  @IsNumber()
  amazonQuantity: number;

  @IsNumber()
  @Min(0)
  @Max(999)
  @IsOptional()
  graingerThreshold?: number;
  @IsOptional()
  @IsString()
  graingerTrackingNumber?: string;
  @IsOptional()
  @IsEnum(GraingerShipMethodEnum)
  graingerShipMethod?: GraingerShipMethodEnum;
  @IsOptional()
  @IsString()
  graingerOrderId?: string;
  @IsOptional()
  @IsDateString()
  graingerShipDate?: Date;
  @IsOptional()
  @IsString()
  graingerWebNumber?: string;
  @IsNumber()
  @IsOptional()
  graingerPackQuantity?: number;

  @IsOptional()
  graingerAccount?: GraingerAccount;

  @IsOptional()
  order?: GetOrderDto;

  @IsString()
  amazonSku: string;

  @IsString()
  amazonItemId: string;

  @IsString()
  @MaxLength(256)
  @IsOptional()
  note?: string;

  @IsOptional()
  @IsEnum(ItemStatusEnum)
  status: ItemStatusEnum;
}
