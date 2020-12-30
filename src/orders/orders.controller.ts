import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { EditOrderDto } from './dto/editOrder.dto';

import { OrderDto } from './dto/order.dto';
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
  async createOrder(@Body() item: OrderDto): Promise<ResponseOrdersDto> {
    return await this.ordersService.save(item);
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async getOrder(@Param() id: { id: string }): Promise<ResponseOrdersDto> {
    return await this.ordersService.findOne(id);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async finAll(
    @Query() query: SortWithPaginationQuery,
  ): Promise<ResponseOrdersDto[]> {
    return this.ordersService.getAll(query);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async updateOrder(
    @Param() id: { id: string },
    @Body() item: EditOrderDto,
  ): Promise<ResponseOrdersDto> {
    return this.ordersService.update(id, item);
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async removeOrder(@Param() id: { id: string }): Promise<ResponseOrdersDto> {
    return await this.ordersService.delete(id);
  }
}
