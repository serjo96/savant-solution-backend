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

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { EditItemDto } from './dto/edit-item.dto';

import { ItemsService } from './items.service';
import { GetItemDto } from './dto/get-item.dto';
import { CollectionResponse } from '../common/collection-response';
import { Request } from 'express';
import { CreateItemDto } from './dto/create-item-dto';
import { GetOrderDto } from '../orders/dto/get-order.dto';
import { ChangeOrderStatusDto } from '../orders/dto/change-order-status.dto';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {
  }

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  createItem(
    @Req() req: Request,
    @Body() item: CreateItemDto,
  ): Promise<GetItemDto> {
    const { user } = req;
    const itemData = {
      ...item,
      user: {
        id: user.id,
      },
    };
    return this.itemsService.save(itemData);
  }

  @Get('/search')
  // @UseInterceptors(new TransformInterceptor(GetItemDto))
  searchAmazonSKU(
    @Query() query: SortWithPaginationQuery,
    @Req() { user }: Request,
  ): Promise<GetItemDto[]> {
    return this.itemsService.findAllSku(user, query);
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  getItem(@Param() id: { id: string }): Promise<GetItemDto> {
    return this.itemsService.findOne(id);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async finAll(
    @Query() query: SortWithPaginationQuery,
    @Req() { user }: Request,
  ): Promise<CollectionResponse<GetItemDto>> {
    return this.itemsService.getAll(user, query);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  async updateItem(
    @Param() { id }: { id: string },
    @Body() item: EditItemDto,
    @Req() req: Request,
  ): Promise<GetItemDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        id: user.id,
      }
    };

    return this.itemsService.update(where, item);
  }

  @Put(':id/status')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  async changeOrderStatus(
    @Param() { id }: { id: string },
    @Body() { status }: any,
    @Req() req: Request,
  ): Promise<GetItemDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        id: user.id,
      },
    };

    return this.itemsService.updateStatus(where, status);
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  removeItem(
    @Req() req: Request,
    @Param() id: { id: string },
  ): Promise<GetItemDto> {
    const { user } = req;
    const where = {
      id,
      user: {
        id: user.id,
      },
    };
    return this.itemsService.delete(where);
  }
}
