import { Exclude, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

import getEnumKeyByEnumValue from '../../utils/enum-format';
import { GoogleShipMethodEnum, StatusEnum } from '../orders.entity';

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
  @Transform((status) => getEnumKeyByEnumValue(StatusEnum, status))
  @IsEnum(GoogleShipMethodEnum)
  googleShipMethod?: GoogleShipMethodEnum;

  @IsNotEmpty()
  @Transform((status) => getEnumKeyByEnumValue(StatusEnum, status))
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
