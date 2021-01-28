import { EditOrderItemDto } from './edit-order-item.dto';
import { Exclude } from 'class-transformer';

export class CreateOrderItemDto extends EditOrderItemDto {
  @Exclude()
  id: string;
}
