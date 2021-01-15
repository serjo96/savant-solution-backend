import { OrderDto } from './dto/order.dto';
import { Orders } from './orders.entity';

const orderDate = {
  id: '9512fbf7-b03c-47a0-b523-570c47b61b62',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  itemId: null,
  quantity: 2,
  recipientName: null,
  supplier: 'aeasee',
  note: null,
  shipDate: null,
  carrierCode: null,
  carrierName: null,
  trackingNumber: null,
  amazonSku: 'AMAz',
  amazonItemId: null,
  amazonOrderId: '491-1553788-1597620',
  graingerShipDate: null,
  graingerTrackingNumber: null,
  graingerShipMethod: null,
  graingerAccountId: null,
  graingerWebNumber: null,
  graingerOrderId: null,
  firstShipAddress: null,
  secondShipAddress: null,
  thirdShipAddress: null,
  shipСity: null,
  shipState: null,
  shipPostalCode: null,
  status: 1,
};
export class OrdersMock {
  findAll(where: any): any[] {
    return [
      orderDate
    ];
  }

  findOne(where: any): any {
    return orderDate;
  }

  create(data: OrderDto): Partial<Orders> {
    return orderDate;
  }

  save(data: OrderDto): Promise<Orders> {
    const promise = new Promise((resolve, rejects) => {
      resolve(orderDate);
    });
    return promise.then();
  }
}
