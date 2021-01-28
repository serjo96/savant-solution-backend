import { OrderStatusEnum, Orders } from '../orders/orders.entity';
import states from 'states-us';

export const checkIncorrectOrderStateReducer = (order: Orders): Orders => {
  const upperCaseState = order.shipState?.toUpperCase();
  const existState = states.find(
    (state) => state.abbreviation === upperCaseState,
  );
  if (existState) {
    order.shipState = existState.name;
    // Если из CSV приходят некорректные штаты, пишем ошибку
  } else {
    order.note =
      (order.note ?? '') +
      `Ship state ${upperCaseState} is invalid; \n`;
    order.shipState = '';
    order.status = OrderStatusEnum.MANUAL;
  }

  return order;
};

// Если из CSV приходят названия штатов апперкейсом, нужно привести к общему виду
export const checkUpperCaseOrderStateReducer = (order: Orders): Orders => {
  const upperCaseState = order.shipState?.toUpperCase();
  const existState = states.find(
    (state) => state.name.toUpperCase() === upperCaseState,
  );
  if (existState) {
    order.shipState = existState.name;
  }

  return order;
};
