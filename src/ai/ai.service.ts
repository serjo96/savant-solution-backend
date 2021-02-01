import { HttpService, Injectable } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { Orders } from '../orders/orders.entity';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';
import { GetGraingerOrder } from './dto/get-grainger-order';
import { ErrorResponse } from '../common/error-response';

type SendAIOrder = {
  items: {
    graingerItemNumber: string;
    graingerQuantity: string;
    account_id: string;
  }[];
  address: {
    contact_name: string;
    ship_address: string;
    postal_code: string;
    city: string;
    state: string;
  };
  amazonOrderId: string;
};

@Injectable()
export class AiService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  addAccount({ email, id, password }: GraingerAccount): Promise<ErrorResponse> {
    return this.http
      .post(`${this.configService.AIURL}/users`, {
        users: [{ account_id: id, login: email, password }],
      })
      .pipe(map((response) => response.data))
      .toPromise();
  }

  addOrdersToAI(orders: Orders[]): Promise<ErrorResponse> {
    const aiOrders: SendAIOrder[] = orders.map(
      (order) =>
        ({
          amazonOrderId: order.amazonOrderId,
          address: {
            contact_name: order.recipientName,
            ship_address: order.shipAddress,
            postal_code: order.shipPostalCode,
            city: order.shipCity,
            state: order.shipState,
          },
          items: order.items.map((orderItem) => ({
            graingerItemNumber: orderItem.graingerItem.graingerItemNumber,
            graingerQuantity: orderItem.amazonQuantity?.toString(),
            account_id: orderItem.graingerItem.graingerAccount.id,
          })),
        } as SendAIOrder),
    );

    return this.http
      .post(`${this.configService.AIURL}/orders`, { orders: aiOrders })
      .pipe(map((response) => response.data))
      .toPromise();
  }

  deleteOrdersFromAI(): Promise<ErrorResponse> {
    return this.http
      .delete(`${this.configService.AIURL}/orders`)
      .pipe(map((response) => response.data))
      .toPromise();
  }

  getOrderStatusesFromAI(
    amazonOrders: string[],
  ): Promise<{ amazonOrders: GetGraingerOrder[] } & ErrorResponse> {
    return this.http
      .post<any>(`${this.configService.AIURL}/get_orders`, { amazonOrders })
      .pipe(map((response) => response.data))
      .toPromise();
  }
}
