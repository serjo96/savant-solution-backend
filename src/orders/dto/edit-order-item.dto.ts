import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { GraingerShipMethodEnum } from '../order-item.entity';
import { GraingerAccount } from '../../grainger-accounts/grainger-account.entity';
import { GetOrderDto } from './get-order.dto';
import { GraingerItem } from '../../grainger-items/grainger-items.entity';

export class EditOrderItemDto {
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

  @IsOptional()
  item?: GraingerItem;

  @IsString()
  @MaxLength(256)
  @IsOptional()
  note?: string;
}
