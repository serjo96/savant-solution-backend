import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { StatusEnum } from '../orders.entity';

export class EditOrderDto {
  @IsOptional()
  @IsString()
  itemNumber: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  threshold?: number;

  @IsString()
  @IsOptional()
  supplier: string;

  @IsString()
  @IsOptional()
  amazonSku: string;

  @IsString()
  @IsOptional()
  altSupplier?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
