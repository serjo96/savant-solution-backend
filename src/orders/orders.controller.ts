import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
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
import { CsvParser } from 'nest-csv-parser';
import { Readable } from 'stream';
import { Orders } from './orders.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '../common/exceptions/bad-request';
import * as CSVToJSON from 'csvtojson';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly csvParser: CsvParser,
    private readonly ordersService: OrdersService,
  ) {
  }

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async createOrder(@Body() item: OrderDto): Promise<ResponseOrdersDto> {
    return await this.ordersService.save(item);
  }

  @Post('/upload')
  // @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  async uploadOrders(@UploadedFile() files): Promise<ResponseOrdersDto[]> {
    const stream = Readable.from(files.buffer.toString());
    try {
      const orders: Orders[] = await CSVToJSON({
        headers: ['recipientName'],
      }).fromStream(stream);
      return this.ordersService.saveAll(orders);
    } catch (error) {
      throw new BadRequestException(error);
    }
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
