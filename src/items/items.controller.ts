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
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { EditItemDto } from './dto/editItem.dto';

import { ItemDto } from './dto/item.dto';
import { Items } from './item.entity';
import { ItemsService } from './items.service';
import { ResponseItemsDto } from './dto/response-items.dto';
import { Buffer, Column, Workbook } from 'exceljs';
import { CollectionResponse } from '../common/collection-response';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  createItem(
    @Req() req: Request,
    @Body() item: ItemDto,
  ): Promise<ResponseItemsDto> {
    const { user } = req;
    const itemData = { ...item, userId: user.id };
    return this.itemsService.save(itemData);
  }

  @Get('/download')
  @UsePipes(new ValidationPipe())
  async exportXlSX(
    @Res() res,
    @Query() query: SortWithPaginationQuery,
  ): Promise<Buffer> {
    const allItems: CollectionResponse<ResponseItemsDto> = await this.itemsService.getAll(
      query,
    );
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
    worksheet.addRows(allItems.result);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'items.xlsx',
    );

    await workbook.xlsx.write(res);
    return workbook.xlsx.writeBuffer();
  }

  @Get(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async getItem(@Param() id: { id: string }): Promise<ResponseItemsDto> {
    return await this.itemsService.findOne(id);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async finAll(
    @Query() query: SortWithPaginationQuery,
    @Req() req: Request,
  ): Promise<CollectionResponse<ResponseItemsDto>> {
    const { user } = req;

    const where: {
      userId: string;
    } = {
      userId: user.id,
    };
    return this.itemsService.getAll(where, query);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  async updateItem(
    @Param() { id }: { id: string },
    @Body() item: EditItemDto,
    @Req() req: Request,
  ): Promise<ResponseItemsDto> {
    const { user } = req;
    const where = { id, userId: user.id };

    return this.itemsService.update(where, item);
  }

  @Delete(':id')
  @UseInterceptors(new TransformInterceptor(ResponseItemsDto))
  removeItem(
    @Req() req: Request,
    @Param() id: { id: string },
  ): Promise<ResponseItemsDto> {
    const { user } = req;
    const where = { id, userId: user.id };
    return this.itemsService.delete(where);
  }
}
