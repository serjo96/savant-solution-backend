import { Exclude, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import getEnumKeyByEnumValue from '../../utils/enum-format';
import { GraingerShipMethodEnum, StatusEnum } from '../orders.entity';

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
  @Transform((status) => getEnumKeyByEnumValue(StatusEnum, status))
  @IsEnum(GraingerShipMethodEnum)
  graingerShipMethod?: GraingerShipMethodEnum;

  @IsNotEmpty()
  @Transform((status) => getEnumKeyByEnumValue(StatusEnum, status))
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
