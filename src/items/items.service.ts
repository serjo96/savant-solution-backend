import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery, sort } from '../common/sort';
import { filter } from '../common/filter';
import { CollectionResponse } from '../common/collection-response';
import { checkRequiredItemFieldsReducer } from '../reducers/items.reducer';
import { User } from '@user/users.entity';
import { Readable } from 'stream';
import * as CSVToJSON from 'csvtojson';
import { SearchService } from '../search/search.service';
import { Item, ItemStatusEnum } from './items.entity';
import { GetItemDto } from './dto/get-item.dto';
import { CreateItemDto } from './dto/create-item-dto';
import { EditItemDto } from './dto/edit-item.dto';
import { Column, Workbook } from 'exceljs';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repository: Repository<Item>,
    private readonly searchService: SearchService,
  ) {}

  private readonly elasticIndex = 'grainger-item';

  async find(where: any): Promise<Item[]> {
    return this.repository.find(where);
  }

  async findOne(where: any): Promise<Item> {
    // const existItem = await this.repository.findOne(where);
    // if (!existItem) {
    //   throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    // }
    // return existItem;
    return this.repository.findOne(where);
  }

  async uploadFromCsv(stream: Readable, user: User): Promise<Item[]> {
    let items: any[] = await CSVToJSON({
      headers: [
        null,
        'amazonSku',
        'graingerItemNumber',
        'graingerPackQuantity',
        null,
        null,
        'graingerThreshold',
        'status',
      ],
      delimiter: ';',
    }).fromStream(stream);

    items = items.map((item) =>
      Item.create({
        ...item,
        status: ItemStatusEnum[item.status.toUpperCase()],
        graingerPackQuantity: +item.graingerPackQuantity,
        graingerThreshold: +item.graingerThreshold,
        user,
      }),
    );

    // Если Item имеет не все поля, ставим статус InActive
    items.forEach((itemForCheck: Item) => {
      const { errorMessage } = checkRequiredItemFieldsReducer(itemForCheck);
      if (errorMessage) {
        itemForCheck.status = ItemStatusEnum.INACTIVE;
      }
    });

    return this.repository.save(items);
  }

  async exportToXlxs(
    res,
    statuses: { label: string; value: ItemStatusEnum }[],
    user: User,
  ) {
    let allItems: any = await this.getAll(user);

    const statusesDict = statuses.reduce(
      (acc, curr) => ({ ...acc, [curr.value]: curr.label }),
      {},
    );

    allItems = allItems.result.map((order) => ({
      ...order,
      status: statusesDict[order.status],
    }));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Items');
    worksheet.columns = [
      { header: 'Item Id', key: 'id', width: 40 },
      { header: 'A-SKU', key: 'amazonSku', width: 20 },
      { header: 'G-ItemNumber', key: 'graingerItemNumber', width: 20 },
      { header: 'G-PACKQTY', key: 'graingerPackQuantity', width: 20 },
      // { header: 'Grainger Account', key: 'graingerAccountId', width: 20 },
      { header: 'Threshold', key: 'graingerThreshold', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
    ] as Array<Column>;
    worksheet.addRows(allItems);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'items.xlsx',
    );

    await workbook.xlsx.write(res);
    return workbook.xlsx.writeBuffer();
  }

  async search(
    query: SortWithPaginationQuery | any,
    userId?: string,
  ): Promise<any> {
    const clause: any = {
      offset: query.offset,
      limit: query.count,
      ...paginator(query),
      index: this.elasticIndex,
      matchFields: {
        query: query.search,
        fields: ['recipientName', 'id'],
      },
    };
    return this.searchService.search<Item>(clause);
  }

  async getAll(
    user: User,
    query?: any,
  ): Promise<CollectionResponse<GetItemDto>> {
    const clause: any = {
      ...sort(query),
      ...paginator(query),
      ...filter(query),
    };
    const [result, count] = await this.repository.findAndCount({
      ...clause,
      where: {
        ...clause.where,
        user: {
          id: user.id,
        },
      },
    });

    if (!result) {
      throw new NotFoundException();
    }
    return {
      result: result.map((order: Item) => plainToClass(GetItemDto, order)),
      count,
    };
  }

  async delete(where: any): Promise<any> {
    const existItem = await this.repository.findOne(where);
    if (!existItem) {
      throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    }
    this.searchService.remove(where.id, this.elasticIndex);
    return await this.repository.softDelete(where);
  }

  async save(data: CreateItemDto): Promise<Item> {
    let existItem = await this.repository.findOne({
      amazonSku: data.amazonSku,
    });
    if (existItem) {
      throw new HttpException(`Item already exist`, HttpStatus.OK);
    }

    existItem = Item.create(data);
    const { errorMessage } = checkRequiredItemFieldsReducer(existItem);
    if (errorMessage) {
      existItem.status = ItemStatusEnum.INACTIVE;
    }
    try {
      this.searchService.createIndex(existItem, 'grainger-item');
      return this.repository.save(existItem);
    } catch (error) {
      console.error(error);
    }
  }

  async update(where: any, editItem: EditItemDto): Promise<Item> {
    const existItem = await this.repository.findOne(where);
    if (!existItem) {
      throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    }
    const updated = Object.assign(existItem, editItem);
    const { errorMessage, item } = checkRequiredItemFieldsReducer(updated);
    if (errorMessage) {
      existItem.status = ItemStatusEnum.INACTIVE;
    }
    try {
      this.searchService.update<Item>(updated, this.elasticIndex);
      return this.repository.save(item);
    } catch (error) {
      console.error(error);
    }
  }

  async updateStatus(
    where: {
      id: string;
      user: {
        id: string;
      };
    },
    status: ItemStatusEnum,
  ): Promise<Item> {
    const existItem = await this.repository.findOne(where);
    if (!existItem) {
      throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    }
    const { errorMessage } = checkRequiredItemFieldsReducer(existItem);
    if (errorMessage) {
      throw new HttpException(errorMessage, HttpStatus.OK);
    }

    existItem.status = status;
    return this.repository.save(existItem);
  }
}
