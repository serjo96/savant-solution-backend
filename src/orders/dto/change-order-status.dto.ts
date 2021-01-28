import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatusEnum } from '../orders.entity';

export class ChangeOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;
}
