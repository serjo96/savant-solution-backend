import {
  IsString
} from 'class-validator';

import { EditItemDto } from './edit-item.dto';
import { Exclude } from 'class-transformer';

export class GetItemDto extends EditItemDto {
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
