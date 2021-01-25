import {
  Body,
  Injectable,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery, sort } from '../common/sort';
import { EditOrderDto } from './dto/editOrder.dto';

import { OrderDto } from './dto/order.dto';
import { ResponseOrdersDto } from './dto/response-orders.dto';
import { Orders, StatusEnum } from './orders.entity';
import { CollectionResponse } from '../common/collection-response';
import * as CSVToJSON from 'csvtojson';
import { Readable } from 'stream';
import { Column, Workbook } from 'exceljs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
  ) {}

  async find(where: any): Promise<Orders[]> {
    return await this.ordersRepository.find(where);
  }

  async findOne(where: any): Promise<Orders> {
    const result = await this.ordersRepository.findOne(where);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async getAll(
    where,
    query?: any,
  ): Promise<CollectionResponse<ResponseOrdersDto>> {
    const clause: any = {
      ...sort(query),
      ...paginator(query),
      where,
    };
    const [result, count] = await this.ordersRepository.findAndCount(clause);
    if (!result) {
      throw new NotFoundException();
    }

    return {
      result: result.map((order: Orders) =>
        plainToClass(ResponseOrdersDto, order),
      ),
      count,
    };
  }

  async delete(where: any): Promise<any> {
    const result = await this.ordersRepository.findOne(where);
    if (!result) {
      throw new NotFoundException();
    }
    return await this.ordersRepository.softDelete(where);
  }

  async exportToXlxs(
    res,
    statuses: { label: string; value: StatusEnum }[],
    query: SortWithPaginationQuery,
  ) {
    let allItems: any = await this.getAll(query);

    const statusesDict = statuses.reduce(
      (acc, curr) => ({ ...acc, [curr.value]: curr.label }),
      {},
    );

    allItems = allItems.result.map((order) => ({
      ...order,
      status: statusesDict[order.status],
    }));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'A Oder ID', key: 'amazonOrderId', width: 40 },
      { header: 'A Item ID', key: 'amazonItemId', width: 40 },
      { header: 'A Quantity', key: 'quantity', width: 20 },
      { header: 'G Ship Date', key: 'graingerShipDate', width: 20 },
      { header: 'G Tracking Number', key: 'graingerTrackingNumber', width: 20 },
      { header: 'G Ship Method', key: 'graingerShipMethod', width: 20 },
      { header: 'A-SKU', key: 'amazonSku', width: 20 },
      { header: 'Recipient Name', key: 'recipientName', width: 20 },
      { header: 'Order Status', key: 'status', width: 20 },
      { header: 'G Account', key: 'graingerAccountId', width: 20 },
      { header: 'G Web Number', key: 'graingerWebNumber', width: 20 },
      { header: 'G Order ID', key: 'graingerOrderId', width: 40 },
      { header: 'Order date', key: 'orderDate', width: 20 },
      { header: 'Supplier', key: 'supplier', width: 20 },
      { header: 'Note', key: 'note', width: 20 },
    ] as Array<Column>;
    worksheet.addRows(allItems);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'orders.xlsx',
    );

    await workbook.xlsx.write(res);
    return workbook.xlsx.writeBuffer();
  }

  async uploadFromCsv(stream: Readable, user) {
    const orders: Orders[] = await CSVToJSON({
      headers: [
        'amazonOrderId',
        'amazonItemId',
        'createdAt',
        null,
        null,
        'recipientName',
        null,
        'amazonSku',
        null,
        'quantity',
        null,
        null,
        null,
        null,
        null,
        null,
        'recipientName',
        'firstShipAddress',
        'secondShipAddress',
        'thirdShipAddress',
        'shipCity',
        'shipState',
        'shipPostalCode',
      ],
    }).fromStream(stream);
    orders.forEach((order) => (order.userId = user.id));
    return this.saveAll(orders);
  }

  async saveAll(data: OrderDto[]): Promise<Orders[]> {
    let orders = data.map((order) => Orders.create(order));
    //TODO КОСТЫЛЬ
    orders = orders.filter((o) => o.shipState?.length <= 2);

    try {
      return await this.ordersRepository.save(orders);
    } catch (e) {
      throw new Error(e);
    }
  }

  async save(data: OrderDto): Promise<Orders> {
    let entity = data;

    if (!(data instanceof Orders)) {
      entity = Orders.create(data);
    }

    try {
      return await this.ordersRepository.save(entity);
    } catch (e) {
      throw new Error(e);
    }
  }

  async update(
    where: { id: string; userId: string },
    item: EditOrderDto,
  ): Promise<Orders> {
    const toUpdate = await this.ordersRepository.findOne(where);
    const updated = Object.assign(toUpdate, item);
    return await this.ordersRepository.save(updated);
  }
}
