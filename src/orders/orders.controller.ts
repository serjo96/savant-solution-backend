import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import { Readable } from 'stream';
import { Buffer } from 'exceljs';
import states from 'states-us';
import { In } from 'typeorm';

import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { Roles } from '../common/decorators/roles';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { EditOrderDto } from './dto/editOrder.dto';
import { CreateOrderDto } from './dto/createOrderDto';
import { GetOrderDto } from './dto/get-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

import { CollectionResponse } from '../common/collection-response';
import { OrderStatusEnum, Orders } from './orders.entity';
import { OrdersSearchService } from './orders-search.service';
import { OrdersService } from './orders.service';
import { AiService } from '../ai/ai.service';
import { GetOrderItemDto } from './dto/get-order-item.dto';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@UseInterceptors(new SentryInterceptor())
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private aiService: AiService,
    private readonly ordersSearchService: OrdersSearchService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async createOrder(
    @Body() item: CreateOrderDto,
    @Req() req: Request,
  ): Promise<GetOrderDto> {
    const { user } = req;
    const orderData = {
      ...item,
      user: {
        id: user.id,
      },
    };
    const response = await this.ordersService.save(orderData);
    this.ordersSearchService.save(response);
    return response;
  }

  @Get('/full-search')
  async searchOrders(
    @Query() query: SortWithPaginationQuery,
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;
    return await this.ordersSearchService.search(query, user.name);
  }

  @Get('/search')
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  searchAmazonSKU(
    @Query() query: any,
    @Req() { user }: Request,
  ): Promise<GetOrderDto[]> {
    return this.ordersService.findByField(user, query);
  }

  @Post('/upload')
  // @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async uploadOrders(
    @Req() req: Request,
    @UploadedFile() files,
  ): Promise<{ success: GetOrderItemDto[]; errors: GetOrderItemDto[] }> {
    const stream = Readable.from(files.buffer.toString());
    const { user } = req;
    const { orders, success, errors } = await this.ordersService.uploadFromCsv(
      stream,
      user,
    );

    if (orders && orders.length) {
      await this.ordersSearchService.save(orders);
    }

    this.sendOrdersToAI(orders);

    return { success, errors };
  }

  private async sendOrdersToAI(orders: Orders[]) {
    const readyToProceedOrders = orders.filter((order) =>
      [OrderStatusEnum.WAITFORPROCEED, OrderStatusEnum.PROCEED].includes(
        order.status,
      ),
    );
    try {
      const { error } = await this.aiService.addOrdersToAI(
        readyToProceedOrders,
      );
      if (error) {
        throw new Error(`[AI Service] ${error.message}`);
      }
      this.logger.debug(
        `[Change Order Status] ${readyToProceedOrders.length} orders went successfully to AI`,
      );
    } catch ({ message }) {
      // const where = {
      //   id: In(readyToProceedOrders.map((order) => order.id)),
      //   user: {
      //     id: user.id,
      //   },
      // };
      // const result = await this.ordersService.updateStatus(
      //   where,
      //   OrderStatusEnum.MANUAL,
      // );
      this.logger.debug(message);
      throw new HttpException(message, HttpStatus.OK);
    }
  }

  @Delete('/remove-elastic-index')
  @Roles('admin')
  async removeEsIndex() {
    return await this.ordersSearchService.deleteEsIndex();
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async finAll(
    @Query() query: SortWithPaginationQuery,
    @Req() req: Request,
  ): Promise<CollectionResponse<GetOrderDto>> {
    const { user } = req;
    let resultOrders;

    const where = {
      user: {
        name: user.name,
      },
    };
    if (query.search) {
      resultOrders = await this.ordersSearchService.search(query, user.name);
    } else {
      resultOrders = await this.ordersService.getAll(where, query);
    }

    return {
      ...resultOrders,
      result: resultOrders.result.map((order: Orders) =>
        plainToClass(GetOrderDto, order),
      ),
    };
  }

  @Post('/download')
  // @UsePipes(new ValidationPipe())
  async exportXlSX(
    @Res() res,
    @Body() statuses: { label: string; value: OrderStatusEnum }[],
    @Req() { user }: Request,
  ): Promise<Buffer> {
    return this.ordersService.exportToXlxs(res, statuses, user);
  }

  @Post('/status')
  async checkOrderStatuses(
    @Body() { orderIds }: { orderIds: string[] },
    @Req() { user }: Request,
  ): Promise<CollectionResponse<GetOrderDto>> {
    const resultOrders = await this.ordersService.getAll({
      user: {
        name: user.name,
      },
      id: In(orderIds),
    });

    return {
      ...resultOrders,
      result: resultOrders.result.map((order: Orders) =>
        plainToClass(GetOrderDto, order),
      ),
    };
  }

  @Get('/states')
  // @UsePipes(new ValidationPipe())
  // @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  getStates(): any {
    return states.map(({ name, abbreviation }) => ({ name, abbreviation }));
  }

  @Get('/update-elastic')
  @Roles('admin')
  async updateOrdersElastic() {
    const { result } = await this.ordersService.getAll();
    return await this.ordersSearchService.save(result);
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async getOrder(
    @Param() { id }: { id: string },
    @Req() req: Request,
  ): Promise<GetOrderDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        name: user.name,
      },
    };
    return await this.ordersService.findOne(where);
  }

  @Put(':id/status')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async changeOrderStatus(
    @Param() { id }: { id: string },
    @Body() { status }: ChangeOrderStatusDto,
    @Req() req: Request,
  ): Promise<GetOrderDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        name: user.name,
      },
    };
    const order = await this.ordersService.updateStatus(where, status);
    await this.ordersSearchService.update(order);
    if (
      [OrderStatusEnum.WAITFORPROCEED, OrderStatusEnum.PROCEED].includes(status)
    ) {
      try {
        const { error } = await this.aiService.addOrdersToAI([order]);
        if (error) {
          throw new Error(`[AI Service] ${error.message}`);
        }
        this.logger.debug(
          `[Change Order Status] Order ${order.id} went successfully to AI`,
        );
      } catch ({ message }) {
        const result = await this.ordersService.updateStatus(
          where,
          OrderStatusEnum.MANUAL,
        );
        await this.ordersSearchService.update(result);
        this.logger.debug(message);
        throw new HttpException(message, HttpStatus.OK);
      }
    }
    return order;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async updateOrder(
    @Param() { id }: { id: string },
    @Body() item: EditOrderDto,
    @Req() req: Request,
  ): Promise<GetOrderDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        id: user.id,
      },
    };

    const response = await this.ordersService.update(where, item);
    await this.ordersSearchService.update(response);
    return response;
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async removeOrder(
    @Param() { id }: { id: string },
    @Req() req: Request,
  ): Promise<GetOrderDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        id: user.id,
      },
    };
    const response = await this.ordersService.delete(where);
    await this.ordersSearchService.delete(id);
    return response;
  }

  @Post('/delete-orders')
  async removeOrders(
    @Body() { orderIds }: { orderIds: string[] },
    @Req() { user }: Request,
  ): Promise<any> {
    const { result } = await this.ordersService.getAll({
      user: {
        name: user.name,
      },
      id: In(orderIds),
    });

    await this.ordersService.delete({
      id: In(orderIds),
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

      await this.ordersSearchService.delete(orderIds);

      this.logger.debug(
        `[Delete Orders] ${result.length} orders deleted successfully from Elastic`,
      );
    } catch ({ message }) {
      this.logger.debug(message);
      throw new HttpException(message, HttpStatus.OK);
    }
  }
}
