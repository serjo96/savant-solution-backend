import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { map, timeout } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { Orders } from '../orders/orders.entity';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';
import { AiGateway } from './ai.gateway';
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

export enum WorkerStatus {
  NOT_WORKING = 0,
  WORKING = 1,
}

@Injectable()
export class AiService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly publicSocketsGateway: AiGateway,
  ) {}

  private logger: Logger = new Logger(AiService.name);

  addAccount({ email, id, password }: GraingerAccount): Promise<ErrorResponse> {
    return this.http
      .post(`${this.configService.aiUrl}/users`, {
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
      .post(`${this.configService.aiUrl}/orders`, { orders: aiOrders })
      .pipe(map((response) => response.data))
      .toPromise();
  }

  deleteOrdersFromAI(amazonOrders: string[]): Promise<ErrorResponse> {
    return this.http
      .delete(`${this.configService.aiUrl}/orders`, { data: { amazonOrders } })
      .pipe(map((response) => response.data))
      .toPromise();
  }

  getOrderStatusesFromAI(
    amazonOrders: string[],
  ): Promise<{ amazonOrders: GetGraingerOrder[] } & ErrorResponse> {
    return this.http
      .post<any>(`${this.configService.aiUrl}/get_orders`, { amazonOrders })
      .pipe(
        timeout(2500),
        map((response) => response.data),
      )
      .toPromise();
  }

  updateTrackingNumberFromAI(
    graingerOrders: {
      graingerOrderId: string;
      account_id: string;
      g_web_number: string;
    }[],
  ): Promise<{ success: boolean } & ErrorResponse> {
    return this.http
      .post<any>(`${this.configService.aiUrl}/tracking_number`, {
        graingerOrders,
      })
      .pipe(
        timeout(2500),
        map((response) => response.data),
      )
      .toPromise();
  }

  async startWorker(): Promise<string> {
    try {
      await this.http
        .get(`${this.configService.aiUrl}/start`)
        .pipe(map((response) => response.data))
        .toPromise();
      return WorkerStatus[1];
    } catch (error) {
      this.logger.error(error);
    }
  }

  async stopWorker(): Promise<string> {
    try {
      await this.http
        .get(`${this.configService.aiUrl}/stop`)
        .pipe(map((response) => response.data))
        .toPromise();
      return WorkerStatus[0];
    } catch (error) {
      this.logger.error(error);
    }
  }

  async workerStatus(): Promise<{ worker_status: WorkerStatus }> {
    return await this.http
      .get(`${this.configService.aiUrl}/worker_status`)
      .pipe(map((response) => response.data))
      .toPromise();
  }

  async checkAiStatus(): Promise<{ status: string }> {
    return await this.http
      .get(`${this.configService.aiUrl}/heart_beat`)
      .pipe(map((response) => response.data))
      .toPromise();
  }

  @Interval('AiStatus', 1000 * 30) // every 30 seconds
  async aiStatus() {
    try {
      const response = await this.checkAiStatus();

      this.publicSocketsGateway.handleStatusMessage(response);
    } catch (error) {
      this.publicSocketsGateway.handleStatusMessage({ status: 'error' });
      this.logger.error('AI Service Timeout');
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(error);
      }
    }

    try {
      const { worker_status } = await this.workerStatus();
      this.publicSocketsGateway.handleWorkerMessage(
        WorkerStatus[worker_status],
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(error);
      }
    }
  }
}
