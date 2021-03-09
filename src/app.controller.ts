import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { OrdersService } from './orders/orders.service';
import { In } from 'typeorm';
import { AiService } from './ai/ai.service';
import { OrdersSearchService } from './orders/orders-search.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private aiService: AiService,
    private readonly ordersSearchService: OrdersSearchService,
  ) {}

  @Get()
  healthCheck() {
    return `Version: ${this.configService.version}`;
  }

  // TODO УДАЛИТЬ ПОТОМ
  @Get('/delete-all')
  async testDeleteAll(): Promise<any> {
    const { result } = await this.ordersService.getAll({});

    await this.ordersService.delete({
      id: In(result.map((order) => order.id)),
    });

    try {
      const { error } = await this.aiService.deleteOrdersFromAI(
        result.map((order) => order.amazonOrderId),
      );
      if (error) {
        throw new Error(`[AI Service] ${error.message}`);
      }

      this.logger.debug(
        `[Delete Orders] ${result.length} orders deleted successfully from AI`,
      );

      await this.ordersSearchService.delete(result.map((order) => order.id));

      this.logger.debug(
        `[Delete Orders] ${result.length} orders deleted successfully from Elastic`,
      );
    } catch ({ message }) {
      this.logger.debug(message);
      throw new HttpException(message, HttpStatus.OK);
    }
    return `Ордеры удалены`;
  }
}
