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
import { GraingerItemsService } from './grainger-items/grainger-items.service';
import { GraingerItemsSearchService } from './grainger-items/grainger-items-search.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly graingerItemsService: GraingerItemsService,
    private aiService: AiService,
    private readonly ordersSearchService: OrdersSearchService,
    private readonly graingerItemsSearchService: GraingerItemsSearchService,
  ) {}

  @Get()
  healthCheck() {
    return `Version: ${this.configService.version}`;
  }

  // TODO УДАЛИТЬ ПОТОМ
  @Get('/delete-all')
  async testDeleteAll(): Promise<any> {
    try {
      await this.deleteOrders();
    } catch (e) {}
    try {
      await this.deleteGraingerItems();
    } catch (e) {}
    return `Ордеры и GraingerItems удалены`;
  }

  private async deleteOrders(): Promise<any> {
    const { result } = await this.ordersService.getAll();

    await this.ordersService.delete({});

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
  }

  private async deleteGraingerItems(): Promise<any> {
    const { result } = await this.graingerItemsService.getAll();

    await this.graingerItemsService.delete({});

    try {
      await this.graingerItemsSearchService.delete(
        result.map((order) => order.id),
      );

      this.logger.debug(
        `[Delete Grainger Items] ${result.length} Grainger Items deleted successfully from Elastic`,
      );
    } catch ({ message }) {
      this.logger.debug(message);
      throw new HttpException(message, HttpStatus.OK);
    }
  }
}
