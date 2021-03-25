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
import { SentryInterceptor } from '@ntegral/nestjs-sentry';

import { Roles } from '../common/decorators/roles';
import { TransformInterceptor } from '../common/interceptors/TransformInterceptor';
import { ValidationPipe } from '../common/Pipes/validation.pipe';
import { SortWithPaginationQuery } from '../common/sort';
import { GraingerItemsSearchService } from './grainger-items-search.service';

import { GraingerItemsService } from './grainger-items.service';
import { CollectionResponse } from '../common/collection-response';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { GetItemDto } from './dto/get-item.dto';
import { CreateItemDto } from './dto/create-item-dto';
import { EditItemDto } from './dto/edit-item.dto';
import { Buffer } from 'exceljs';
import { ItemStatusEnum } from './grainger-items.entity';
import { In } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@Roles('user', 'admin')
@UseInterceptors(new SentryInterceptor())
@Controller('grainger-items')
export class GraingerItemsController {
  private readonly logger = new Logger(GraingerItemsController.name);
  constructor(
    private readonly itemsService: GraingerItemsService,
    private readonly itemsSearchService: GraingerItemsSearchService,
  ) {}

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  async add(
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
    const response = await this.itemsService.save(itemData);
    this.itemsSearchService.save(response);
    return response;
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(new TransformInterceptor(GetItemDto))
  async uploadOrders(
    @Req() req: Request,
    @UploadedFile() files,
  ): Promise<GetItemDto[]> {
    const stream = Readable.from(files.buffer.toString());
    const { user } = req;
    const response = await this.itemsService.uploadFromCsv(stream, user);
    if (response && response.length) {
      await this.itemsSearchService.save(response);
    }
    return response;
  }

  @Post('/download')
  async exportXlSX(
    @Res() res,
    @Body() statuses: { label: string; value: ItemStatusEnum }[],
    @Req() { user }: Request,
  ): Promise<Buffer> {
    return this.itemsService.exportToXlxs(res, statuses, user);
  }

  @Get('/full-search')
  // @UseInterceptors(new TransformInterceptor(GetItemDto))
  searchAmazonSKU(
    @Query() query: SortWithPaginationQuery,
    @Req() { user }: Request,
  ): Promise<GetItemDto[]> {
    return this.itemsSearchService.search(query, user.name);
  }

  @Get('/update-elastic')
  @Roles('admin')
  async updateOrdersElastic() {
    const { result } = await this.itemsService.getAll();
    return await this.itemsSearchService.save(result);
  }

  @Delete('/remove-elastic-index')
  @Roles('admin')
  async removeEsIndex() {
    return await this.itemsSearchService.deleteEsIndex();
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
    if (query.search) {
      return this.itemsSearchService.search(query, user.name);
    } else {
      return this.itemsService.getAll(user, query);
    }
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
      },
    };

    const response = await this.itemsService.update(where, item);
    this.itemsSearchService.update(response);
    return response;
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

    const result = await this.itemsService.updateStatus(where, status);
    this.itemsSearchService.update(result);
    return result;
  }

  @Post('/delete-items')
  async removeItems(
    @Body() { itemIds }: { itemIds: string[] },
    @Req() { user }: Request,
  ): Promise<any> {
    const { result } = await this.itemsService.getAll({
      user: {
        name: user.name,
      },
      id: In(itemIds),
    });

    await this.itemsService.delete({
      id: In(itemIds),
    });

    try {
      await this.itemsSearchService.delete(itemIds);

      this.logger.debug(
        `[Delete Items] ${result.length} items deleted successfully from Elastic`,
      );
    } catch ({ message }) {
      this.logger.debug(message);
      throw new HttpException(message, HttpStatus.OK);
    }
  }
}
