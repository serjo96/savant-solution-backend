import { Exclude } from 'class-transformer';

import { GetOrderDto } from './get-order.dto';

export class CreateOrderDto extends GetOrderDto {
  @Exclude()
  id: string;
}
