import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString, Max, Min,
} from 'class-validator';

import { GraingerAccount } from '../../grainger-accounts/grainger-account.entity';
import { ItemStatusEnum } from '../grainger-items.entity';

export class EditItemDto {
  @IsOptional()
  @IsString()
  graingerItemNumber?: string;

  @IsNumber()
  @Min(0)
  @Max(999)
  @IsOptional()
  graingerThreshold?: number;
  @IsNumber()
  @IsOptional()
  graingerPackQuantity?: number;

  @IsOptional()
  graingerAccount?: GraingerAccount;

  @IsString()
  amazonSku: string;

  @IsOptional()
  @IsEnum(ItemStatusEnum)
  status: ItemStatusEnum;
}
