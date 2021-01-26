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
import { GraingerAccount } from '../../grainger-accounts/grainger-account.entity';

export class ItemDto {
  @Exclude()
  id?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
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

  @IsOptional()
  graingerAccount?: GraingerAccount;

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
