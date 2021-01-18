import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { EditOrderDto } from './dto/editOrder.dto';

import { OrderDto } from './dto/order.dto';
import { Orders } from './orders.entity';
import { OrdersService } from './orders.service';
import { ResponseOrdersDto } from './dto/response-orders.dto';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async createOrder(
    @Body() item: OrderDto,
    @Req() req: Request,
  ): Promise<ResponseOrdersDto> {
    const { user } = req;
    const orderData = { ...item, userId: user.id };
    return await this.ordersService.save(orderData);
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async getOrder(
    @Param() { id }: { id: string },
    @Req() req: Request,
  ): Promise<ResponseOrdersDto> {
    const { user } = req;
    const where: {
      id: string;
      userId: string;
    } = {
      id,
      userId: user.id,
    };
    return await this.ordersService.findOne(where);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async finAll(
    @Query() query: SortWithPaginationQuery,
    @Req() req: Request,
  ): Promise<{ result: ResponseOrdersDto[]; count: number }> {
    const { user } = req;

    const where: {
      userId: string;
    } = {
      userId: user.id,
    };
    return this.ordersService.getAll(where, query);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async updateOrder(
    @Param() { id }: { id: string },
    @Body() item: EditOrderDto,
    @Req() req: Request,
  ): Promise<ResponseOrdersDto> {
    const { user } = req;
    const where = { id, userId: user.id };

    return this.ordersService.update(where, item);
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async removeOrder(
    @Param() id: { id: string },
    @Req() req: Request,
  ): Promise<ResponseOrdersDto> {
    const { user } = req;
    const where = { id, userId: user.id };
    return await this.ordersService.delete(where);
  }
}
