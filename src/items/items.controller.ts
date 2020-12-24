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
import { PaginatorQuery } from '../common/paginator';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { EditItemDto } from './dto/editItem.dto';

import { ItemDto } from './dto/item.dto';
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
  async createItem(@Body() item: ItemDto): Promise<ResponseItemsDto> {
    return await this.itemsService.save(item);
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async getItem(@Param() id: { id: string }): Promise<ResponseItemsDto> {
    return await this.itemsService.findOne(id);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async finAll(@Query() query: PaginatorQuery): Promise<ResponseItemsDto[]> {
    return this.itemsService.getAll(query);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async updateItem(
    @Param() id: { id: string },
    @Body() item: EditItemDto,
  ): Promise<ResponseItemsDto> {
    return this.itemsService.update(id, item);
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async removeItem(@Param() id: { id: string }): Promise<ResponseItemsDto> {
    return await this.itemsService.delete(id);
  }
}
