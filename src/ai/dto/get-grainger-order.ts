export enum GraingerStatusEnum {
  INQUEUE = 0,
  Proceed = 1,
  Success = 2,
  Error = 3,
}

/**
 Ошибки во время заказа:
 0 - другой заказ из amazon order отклонен
 1 - ошибки на этапе sing in
 2 - не очистили корзину
 3 - ошибки на странице bulk order pad
 4 - ошибки на странице cart
 5 - один из items стоит дороже amazon_item помноженный на коэффициент
 6 - не смогли открыть окно редактирования адреса
 7 - ошибка в процессе редактирования формы адреса
 8 - grainger не смог распознать адрес
 9 - доставка не бесплатна
 10 - заказ ожидал подтверждения, не смогли подтвердить

 Ошибки на этапе проверки tracking number:
 11 - ошибки на этапе sing in
 12 - не смогли начать поиск заказа
 13 - не смогли открыть детали ордера
 14 - не смогли получить track_shipment
 */
export enum AIGraingerOrderError {
  SignIn = 1,
  NotEmptyTrash = 2,
  BulkOrderPad = 3,
  CartPage = 4,
  ExpensiveItem = 5,
  CouldNotEdit = 6,
  EditAddress = 7,
  NotRecognizeAddress = 8,
  NotFreeDelivery = 9,
  AwaitingConfirmationOrder = 10,
  TrackingNumberSignIn = 11,
  CouldNotStartSearching = 12,
  CouldNotOpenOrderDetails = 13,
  CouldNotGetTrackShipment = 14,
}

export class GetGraingerOrder {
  amazonOrderId: string;
  status: GraingerStatusEnum;
  graingerOrders: {
    graingerOrderId: string;
    g_web_number: string;
    graingerTrackingNumber: string;
    error?: AIGraingerOrderError;
    items: {
      graingerItemNumber: string;
      graingerPrice: number;
    }[];
  }[];
}
