import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BadRequestException } from '../common/exceptions/bad-request';
import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';

import { ItemDto } from './dto/item.dto';
import { Items } from './item.entity';
import { ItemsService } from './items.service';
import { ResponseItemsDto } from './dto/response-items.dto';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async createItem(@Body() item: ItemDto): Promise<{ data: ResponseItemsDto} > {
    const result = await this.itemsService.save(item);
    return {
      data: result
    };
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async getItem(@Param() id: string): Promise<{data: Items}>{
    const result = await this.itemsService.findOne(id);
    return {
      data: result
    }
  }

  @Get()
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async finAll(@Query() query: any): Promise<{ data: Items[]}> {
    const result = await this.itemsService.getAll(query);

    return {
      data: result
    }
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async removeItem(@Param() id: string): Promise<{data: Items}>{
    const result = await this.itemsService.delete(id);
    return {
      data: result
    }
  }

}
