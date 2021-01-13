import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as moment from 'moment';

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { EditItemDto } from './dto/editItem.dto';

import { ItemDto } from './dto/item.dto';
import { ItemsService } from './items.service';
import { ResponseItemsDto } from './dto/response-items.dto';
import { Column, Workbook } from 'exceljs';

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

  @Get('/download')
  @UsePipes(new ValidationPipe())
  async exportXlSX(
    @Res() res,
    @Query() query: SortWithPaginationQuery,
  ): Promise<Buffer> {
    const allItems: any[] = await this.itemsService.getAll(query);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Items');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'G-PACKQTY', key: 'quantity', width: 12 },
      { header: 'A-SKU', key: 'amazonSku', width: 25 },
      { header: 'G-ItemNumber', key: 'itemNumber', width: 18 },
      { header: 'Treshold', key: 'threshold', width: 10 },
      { header: 'Supplier', key: 'supplier', width: 20 },
      { header: 'Alt supplier', key: 'altSupplier', width: 20 },
      { header: 'Note', key: 'note', width: 20 },
      { header: 'Order date', key: 'createdAt', width: 25 },
    ] as Array<Column>;
    worksheet.addRows(allItems);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'items.xlsx',
    );

    return workbook.xlsx.write(res).then(() => res.status(200).end());
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async getItem(@Param() id: { id: string }): Promise<ResponseItemsDto> {
    return await this.itemsService.findOne(id);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async finAll(
    @Query() query: SortWithPaginationQuery,
  ): Promise<ResponseItemsDto[]> {
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
