import { Exclude, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { GraingerShipMethodEnum, StatusEnum } from '../orders.entity';

export class OrderDto {
  @Exclude()
  id?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
  @IsString()
  itemId?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  note?: string;

  @IsOptional()
  @IsDateString()
  shipDate?: Date;

  @IsOptional()
  @IsString()
  carrierCode?: string;

  @IsOptional()
  @IsString()
  carrierName?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  amazonSku?: string;

  @IsString()
  @IsOptional()
  amazonItemId?: string;

  @IsString()
  @IsOptional()
  amazonOrderId?: string;

  @IsDateString()
  @IsOptional()
  graingerShipDate?: Date;

  @IsString()
  @IsOptional()
  graingerTrackingNumber?: string;

  @IsString()
  @IsOptional()
  graingerAccountId?: string;

  @IsString()
  @IsOptional()
  graingerWebNumber?: string;

  @IsOptional()
  @Transform((status) => GraingerShipMethodEnum[status.toUpperCase()])
  @IsEnum(GraingerShipMethodEnum)
  graingerShipMethod?: GraingerShipMethodEnum;

  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
