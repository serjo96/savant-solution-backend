import { GraingerItem, ItemStatusEnum } from '../grainger-items/grainger-items.entity';

// Если нет необходимых полей для Димы, пишем ошибку
export const checkRequiredItemFieldsReducer = (
  item: GraingerItem,
): { item: GraingerItem; errorMessage?: string } => {
  let errorMessage;
  if (
    !item?.graingerItemNumber ||
    !item?.graingerPackQuantity ||
    !item?.graingerThreshold ||
    !item?.graingerAccount
  ) {
    if (item) {
      item.status = ItemStatusEnum.INACTIVE;
    }

    errorMessage =
      [
        !item?.graingerItemNumber ? 'Grainger Item Number' : '',
        !item?.graingerPackQuantity ? 'Grainger Pack Quantity' : '',
        !item?.graingerThreshold ? 'Grainger Threshold' : '',
        !item?.graingerAccount ? 'Grainger Account' : '',
      ]
        .filter((mes) => mes)
        .join(', ') + ` required; \n`;
  }

  return { item, errorMessage };
};
