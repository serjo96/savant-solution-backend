import { Controller, Get, Query, Req } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { Request } from 'express';
import { OrdersService } from './orders/orders.service';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  healthCheck() {
    return `Version: ${this.configService.version}`;
  }

  // TODO УДАЛИТЬ ПОТОМ
  @Get('/delete-all')
  async testDeleteAll(): Promise<any> {
    await this.ordersService.delete({});
    return `Ордеры удалены`;
  }
}
