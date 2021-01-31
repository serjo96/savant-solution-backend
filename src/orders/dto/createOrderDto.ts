import { Exclude } from 'class-transformer';

import { GetOrderDto } from './get-order.dto';
import { EditOrderDto } from './editOrder.dto';

export class CreateOrderDto extends EditOrderDto {
  @Exclude()
  id: string;
}
