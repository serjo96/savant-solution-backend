import { OrderStatusEnum, Orders } from '../orders/orders.entity';
import { ItemStatusEnum, Items } from '../items/item.entity';

// Если нет необходимых полей для Димы, пишем ошибку
export const checkRequiredItemFieldsReducer = (
  item: Items,
  order?: Orders,
): { order?: Orders; item: Items; errorMessage?: string } => {
  let errorMessage;
  if (
    !item.graingerItemNumber ||
    !item.graingerPackQuantity ||
    !item.graingerThreshold ||
    !item.graingerAccount
  ) {
    if (order) {
      order.status = OrderStatusEnum.MANUAL;
    }
    item.status = ItemStatusEnum.INACTIVE;

    errorMessage =
      [
        !item.graingerItemNumber ? 'Grainger Item Number' : '',
        !item.graingerPackQuantity ? 'Grainger Pack Quantity' : '',
        !item.graingerThreshold ? 'Grainger Threshold' : '',
        !item.graingerAccount ? 'Grainger Account' : '',
      ]
        .filter((mes) => mes)
        .join(', ') + ` required; \n`;

    item.note = (item.note ?? '') + errorMessage;
  }

  return { order, item, errorMessage };
};