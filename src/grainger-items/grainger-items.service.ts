import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { ILike, In, Repository } from 'typeorm';
import { Column, Workbook } from 'exceljs';
import { Readable } from 'stream';

import { paginator } from '../common/paginator';
import { sort, splitSortProps } from '../common/sort';
import { filter } from '../common/filter';
import { checkRequiredItemFieldsReducer } from '../reducers/items.reducer';

import { CsvService } from '@shared/csv/csv.service';
import { CollectionResponse } from '../common/collection-response';
import { User } from '@user/users.entity';
import { GraingerItem, ItemStatusEnum } from './grainger-items.entity';
import { GetItemDto } from './dto/get-item.dto';
import { CreateItemDto } from './dto/create-item-dto';
import { EditItemDto } from './dto/edit-item.dto';
import { CsvCreateGraingerItem } from './dto/csv-create-grainger-item';
import { GraingerAccountsService } from '../grainger-accounts/grainger-accounts.service';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';

@Injectable()
export class GraingerItemsService {
  private readonly logger = new Logger(GraingerItemsService.name);

  constructor(
    private readonly graingerAccountService: GraingerAccountsService,
    private readonly csvService: CsvService,
    @InjectRepository(GraingerItem)
    private readonly repository: Repository<GraingerItem>,
  ) {}

  async find(where: any): Promise<GraingerItem[]> {
    return this.repository.find(where);
  }

  async findOne(where: any): Promise<GraingerItem> {
    // const existItem = await this.repository.findOne(where);
    // if (!existItem) {
    //   throw new HttpException(`Item doesn't exist`, HttpStatus.OK);
    // }
    // return existItem;
    return this.repository.findOne(where);
  }

  async uploadFromCsv(stream: Readable, user: User): Promise<GraingerItem[]> {
    const csvItems = await this.convertCsvToDto(stream);

    const uniqAmazonSkus = this.getUniqFields(csvItems, 'amazonSku');

    // Находим уже существующие amazonItemId, чтобы их не трогать и в конце написать "Такие уже есть"
    const existGraingerItems: GraingerItem[] = await this.repository.find({
      where: { amazonSku: In(uniqAmazonSkus) },
    });

    const graingerAccounts: any[] = await this.graingerAccountService.getAll({
      where: {
        email: ILike(In(this.getUniqFields(csvItems, 'graingerLogin', true))),
      },
    });

    let items: (GraingerItem & any)[] = csvItems.map((item) =>
      GraingerItem.create({
        ...item,
        status: ItemStatusEnum[item.status.toUpperCase()],
        graingerPackQuantity: +item.graingerPackQuantity,
        graingerThreshold: +item.graingerThreshold,
        graingerAccount: graingerAccounts.find(
          (i) => i.email.toLowerCase() === item.graingerLogin.toLowerCase(),
        ),
        user,
      }),
    );

    // Перезаписываем если уже существуют
    items = items.map((item) => ({
      ...existGraingerItems.find(
        (i) =>
          i.amazonSku === item.amazonSku ||
          i.graingerItemNumber === item.graingerItemNumber,
      ),
      ...item,
    }));

    // Если Item имеет не все поля, ставим статус InActive
    items.forEach((itemForCheck: GraingerItem) => {
      const { errorMessage } = checkRequiredItemFieldsReducer(itemForCheck);
      if (errorMessage) {
        itemForCheck.status = ItemStatusEnum.INACTIVE;
      }
    });

    return this.repository.save(items);
  }

  private async convertCsvToDto(
    stream: Readable,
  ): Promise<CsvCreateGraingerItem[]> {
    const headers = [
      null,
      'amazonSku',
      'graingerItemNumber',
      'graingerPackQuantity',
      null,
      null,
      'graingerThreshold',
      'status',
      'graingerLogin',
    ];

    const csvItems: CsvCreateGraingerItem[] = await this.csvService.uploadFromCsv<CsvCreateGraingerItem>(
      stream,
      headers,
      ',',
    );
    if (
      csvItems.some(
        (orderItem) =>
          !this.csvService.isValidCSVRow(
            orderItem,
            headers.slice(0, headers.length - 2),
          ), // Не считаем кастомный graingerLogin
      )
    ) {
      throw new HttpException(`Invalid CSV file`, HttpStatus.OK);
    }

    return csvItems;
  }

  async exportToXlxs(
    res,
    statuses: { label: string; value: ItemStatusEnum }[],
    user: User,
  ) {
    let allItems: any = await this.repository
      .createQueryBuilder('gi')
      .leftJoin(GraingerAccount, 'ga', 'ga.id = gi.graingerAccountId')
      .leftJoin(User, 'users', 'users.id = gi.userId')
      .where('users.name=:name', { name: user.name })
      .select(['gi', 'ga'])
      .getRawMany();

    const statusesDict = statuses.reduce(
      (acc, curr) => ({ ...acc, [curr.value]: curr.label }),
      {},
    );

    allItems = allItems.map((order) => ({
      ...order,
      ['gi_status']: statusesDict[order['gi_status']],
    }));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Items');
    worksheet.columns = [
      { header: 'Item Id', key: 'gi_id', width: 40 },
      { header: 'A-SKU', key: 'gi_amazonSku', width: 20 },
      {
        header: 'G-ItemNumber',
        key: 'gi_graingerItemNumber',
        width: 20,
      },
      {
        header: 'G-PACKQTY',
        key: 'gi_graingerPackQuantity',
        width: 20,
      },
      {
        header: 'Supplier',
        // key: 'gi_graingerPackQuantity',
        width: 20,
      },
      {
        header: 'Alt Supplier',
        // key: 'gi_graingerPackQuantity',
        width: 20,
      },
      {
        header: 'Threshold',
        key: 'gi_graingerThreshold',
        width: 20,
      },
      { header: 'Status', key: 'gi_status', width: 20 },
      { header: 'Grainger Account', key: 'ga_email', width: 20 },
    ] as Array<Column>;
    worksheet.addRows(allItems);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'grainger-items.xlsx',
    );

    await workbook.xlsx.write(res);
    return workbook.xlsx.writeBuffer();
  }

  async getAll(where?, query?: any): Promise<CollectionResponse<GetItemDto>> {
    const clause: any = {
      ...sort(query),
      ...paginator(query),
      ...filter(query),
    };
    clause.where = { ...clause.where, ...where };
    // const [result, count] = await this.repository.findAndCount({
    //   relations: ["user",],
    //   ...clause,
    //   where: {
    //     ...clause.where,
    //     user: {
    //       name: user.name,
    //     },
    //   },
    // });

    const items = this.repository
      .createQueryBuilder('grainger-items')
      .leftJoinAndSelect('grainger-items.graingerAccount', 'graingerAccount')
      .leftJoinAndSelect('grainger-items.orderItems', 'orderItems')
      .leftJoinAndSelect('grainger-items.user', 'user');

    if (clause.where.user && clause.where.user.name) {
      items.where('user.name =:name', { name: clause.where.user.name });
    }

    if (clause.take) {
      items.take(clause.take);
    }

    if (clause.skip) {
      items.limit(clause.skip);
    }

    if (query?.sort_by) {
      const { sortType, sortDir } = splitSortProps(query.sort_by);
      items.orderBy(`grainger-items.${sortType}`, sortDir);
    }

    if (clause.where.status || clause.where.status === 0) {
      items.andWhere('grainger-items', { status: clause.where.status });
    }

    if (clause.where.graingerItemNumber) {
      items.where({
        graingerItemNumber: clause.where.graingerItemNumber,
      });
    }

    const [result, count] = await items.getManyAndCount();

    if (!result) {
      throw new NotFoundException();
    }

    return {
      result: result.map((order: GraingerItem) =>
        plainToClass(GetItemDto, order),
      ),
      count,
    };
  }

  async delete(where: any): Promise<any> {
    return this.repository.delete(where);
  }

  async save(data: CreateItemDto): Promise<GraingerItem> {
    let existItem = await this.repository.findOne({
      where: {
        amazonSku: data.amazonSku,
      },
    });

    this.logger.debug(existItem);

    if (existItem) {
      throw new HttpException(`Item already exist`, HttpStatus.OK);
    }

    existItem = GraingerItem.create(data);
    const { errorMessage } = checkRequiredItemFieldsReducer(existItem);
    if (errorMessage) {
      existItem.status = ItemStatusEnum.INACTIVE;
    }

    return this.repository.save(existItem);
  }

  async update(where: any, editItem: EditItemDto): Promise<GraingerItem> {
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
  ): Promise<GraingerItem> {
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

  private getUniqFields = (
    array: any[],
    field?: string,
    toLowerCase?: boolean,
  ) => {
    return [
      ...new Set(
        array.map((item) =>
          field
            ? toLowerCase
              ? item[field].toLowerCase()
              : item[field]
            : item,
        ),
      ),
    ];
  };
}
