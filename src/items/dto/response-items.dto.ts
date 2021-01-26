import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import getEnumKeyByEnumValue from '../../utils/enum-format';
import { StatusEnum } from '../item.entity';
import { GraingerAccount } from '../../grainger-accounts/grainger-account.entity';

export class ResponseItemsDto {
  @IsOptional()
  @IsString()
  itemNumber: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  threshold?: number;

  @IsOptional()
  graingerAccount?: GraingerAccount;

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
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
