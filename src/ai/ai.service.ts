import { HttpService, Injectable } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { Orders } from '../orders/orders.entity';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';
import { GetGraingerOrder } from './dto/get-grainger-order';

type SendAIOrder = {
  items: {
    item_id: string;
    quantity: string;
    account_id: string;
  }[];
  address: {
    contact_name: string;
    ship_address: string;
    postal_code: string;
    city: string;
    state: string;
  };
  order_id: string;
};

@Injectable()
export class AiService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  addAccount({ email, id, password }: GraingerAccount) {
    return this.http.post(`${this.configService.AIURL}/users`, {
      users: [{ account_id: id, login: email, password }],
    });
  }

  addOrdersToAI(orders: Orders[]) {
    const aiOrders: SendAIOrder[] = orders
      .map((order) => ({
        order_id: order.id,
        address: {
          contact_name: order.recipientName,
          ship_address: order.shipAddress,
          postal_code: order.shipPostalCode,
          city: order.shipCity,
          state: order.shipState,
        },
        items: order.items.map((orderItem) => ({
          item_id: orderItem.item.graingerItemNumber,
          quantity: orderItem.amazonQuantity?.toString(),
          account_id: orderItem.item.graingerAccount.id,
        })),
      }))
      .slice(0, 1);

    return this.http
      .post(`${this.configService.AIURL}/orders`, { orders: aiOrders })
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        map((response) => response.data.orders),
      );
  }

  deleteOrdersFromAI() {
    return this.http.delete(`${this.configService.AIURL}/orders`);
  }

  getOrderStatusesFromAI(amazonOrders: string[]): Promise<GetGraingerOrder[]> {
    return this.http
      .post<any>(`${this.configService.AIURL}/get_orders`, { amazonOrders })
      .pipe(map((response) => response.data.amazonOrders))
      .toPromise();
  }
}
