import { Exclude, Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { StatusEnum } from '../item.entity';

export class ItemDto {
  @Exclude()
  id?: string;

  @IsNotEmpty()
  @IsString()
  itemNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Max(999)
  @IsOptional()
  threshold?: number;

  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsString()
  @IsNotEmpty()
  amazonSku: string;

  @IsString()
  @IsOptional()
  altSupplier?: string;

  @IsString()
  @MaxLength(256)
  @IsOptional()
  note?: string;

  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
