import {
  IsString
} from 'class-validator';

import { EditOrderItemDto } from './edit-order-item.dto';
import { Exclude } from 'class-transformer';

export class GetOrderItemDto extends EditOrderItemDto {
  @IsString()
  id: string;

  @Exclude()
  order: any;

  @Exclude()
  createdAt: any;

  @Exclude()
  updatedAt: any;

  @Exclude()
  deletedAt: any;
}
