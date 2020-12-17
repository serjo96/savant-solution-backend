import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import getEnumKeyByEnumValue from '../../utils/enum-format';
import { StatusEnum } from '../item.entity';

export class ResponseItemsDto {
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


  @IsString()
  @IsOptional()
  note?: string;

  @IsNotEmpty()
  @Transform(status => getEnumKeyByEnumValue(StatusEnum, status))
  @IsEnum(StatusEnum)
  status: StatusEnum;

}
