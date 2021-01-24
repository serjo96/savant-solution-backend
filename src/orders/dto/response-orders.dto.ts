import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { GraingerShipMethodEnum, StatusEnum } from '../orders.entity';
import { Exclude } from 'class-transformer';

export class ResponseOrdersDto {
  id: string;

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

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  shipDate?: Date;

  @IsString()
  @IsOptional()
  carrierCode?: string;

  @IsString()
  @IsOptional()
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
  @IsEnum(GraingerShipMethodEnum)
  graingerShipMethod?: GraingerShipMethodEnum;

  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  deletedAt: Date;
}
