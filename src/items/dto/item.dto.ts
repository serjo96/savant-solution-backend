import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { StatusEnum } from '../item.entity';

export class ItemDto {
  @IsNotEmpty()
  @IsString()
  itemNumber: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNumber()
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

  @IsNotEmpty()
  @Transform(status => StatusEnum[status.toUpperCase()])
  @IsEnum(StatusEnum)
  status: StatusEnum;

}
