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
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Readable } from 'stream';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '../common/exceptions/bad-request';

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { SearchService } from '../search/search.service';
import { EditOrderDto } from './dto/editOrder.dto';
import { CreateOrderDto } from './dto/createOrderDto';
import states from 'states-us';

import { OrderStatusEnum } from './orders.entity';
import { OrdersService } from './orders.service';
import { GetOrderDto } from './dto/get-order.dto';
import { CollectionResponse } from '../common/collection-response';
import { Buffer } from 'exceljs';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { AiService } from '../ai/ai.service';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private aiService: AiService,
    private readonly searchService: SearchService,
  ) {}

  @Post('/create')
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
    return await this.ordersService.save(orderData);
  }

  @Post('/upload')
  // @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async uploadOrders(
    @Req() req: Request,
    @UploadedFile() files,
  ): Promise<GetOrderDto[]> {
    const stream = Readable.from(files.buffer.toString());
    const { user } = req;
    try {
      return this.ordersService.uploadFromCsv(stream, user);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async finAll(
    @Query() query: SortWithPaginationQuery,
    @Req() req: Request,
  ): Promise<CollectionResponse<GetOrderDto>> {
    const { user } = req;

    const where = {
      user: {
        id: user.id,
      },
    };
    return this.ordersService.getAll(where, query);
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

  @Get('/states')
  // @UsePipes(new ValidationPipe())
  // @UseInterceptors(new TransformInterceptor(ResponseOrdersDto))
  getStates(): any {
    return states.map(({ name, abbreviation }) => ({ name, abbreviation }));
  }

  @Get('/search')
  async searchOrders(
    @Query() query: SortWithPaginationQuery,
    @Req() req: Request,
  ): Promise<any> {
    const { user } = req;
    return await this.ordersService.search(query, user.id);
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
        id: user.id,
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
        id: user.id,
      },
    };
    const order = await this.ordersService.updateStatus(where, status);
    if (status === OrderStatusEnum.PROCEED) {
      try {
        const { error } = await this.aiService.addOrdersToAI([order]);
        if (error) {
          throw new Error(`[AI Service] ${error.message}`);
        }
        this.logger.debug(
          `[Change Order Status] Order ${order.id} went successfully to AI`,
        );
      } catch ({ message }) {
        await this.ordersService.updateStatus(where, OrderStatusEnum.MANUAL);
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

    return await this.ordersService.update(where, item);
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(GetOrderDto))
  async removeOrder(
    @Param() id: { id: string },
    @Req() req: Request,
  ): Promise<GetOrderDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        id: user.id,
      },
    };
    return await this.ordersService.delete(where);
  }
}
