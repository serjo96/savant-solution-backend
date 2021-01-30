import { EditItemDto } from './edit-item.dto';
import { Exclude } from 'class-transformer';

export class CreateItemDto extends EditItemDto {
  @Exclude()
  id: string;
}
