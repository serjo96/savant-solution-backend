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
import { Item, ItemStatusEnum } from './items.entity';
import { GetItemDto } from './dto/get-item.dto';
import { CreateItemDto } from './dto/create-item-dto';
import { EditItemDto } from './dto/edit-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repository: Repository<Item>,
  ) {}

  async find(where: any): Promise<Item[]> {
    return this.repository.find(where);
  }

  async findOne(where: any): Promise<Item> {
    const existItem = await this.repository.findOne(where);
    if (!existItem) {
      throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    }
    return existItem;
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

    return this.repository.save(items);
  }

  findAllSku(user: User, query?: SortWithPaginationQuery): Promise<Item[]> {
    return this.repository
      .createQueryBuilder('items')
      .where('items.user.id=:id', { id: user.id })
      .andWhere('items.amazonSku LIKE :amazonSku', {
        amazonSku: `%${query.amazonSku}%`,
      })
      .select(
        'DISTINCT ("amazonSku"), "graingerPackQuantity", "graingerItemNumber"',
      )
      .getRawMany();
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
      throw new HttpException(errorMessage, HttpStatus.OK);
    }

    if (!existItem.graingerItemNumber) {
      existItem.status = ItemStatusEnum.INACTIVE;
    }
    return this.repository.save(existItem);
  }

  async update(where: any, editItem: EditItemDto): Promise<Item> {
    const existItem = await this.repository.findOne(where);
    if (!existItem) {
      throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    }
    const updated = Object.assign(existItem, editItem);
    const { errorMessage, item } = checkRequiredItemFieldsReducer(updated);
    if (errorMessage) {
      throw new HttpException(errorMessage, HttpStatus.OK);
    }
    return this.repository.save(item);
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
