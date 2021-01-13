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

import { GoogleShipMethodEnum, StatusEnum } from '../orders.entity';

export class OrderDto {
  @Exclude()
  id?: string;

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
  googleShipDate?: Date;

  @IsString()
  @IsOptional()
  googleTrackingNumber?: string;

  @IsString()
  @IsOptional()
  googleAccountId?: string;

  @IsString()
  @IsOptional()
  googleWebNumber?: string;

  @IsOptional()
  @Transform((status) => GoogleShipMethodEnum[status.toUpperCase()])
  @IsEnum(GoogleShipMethodEnum)
  googleShipMethod?: GoogleShipMethodEnum;

  @IsNotEmpty()
  @Transform((status) => StatusEnum[status.toUpperCase()])
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
