import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { SentryService } from '@ntegral/nestjs-sentry';
import { In, Repository } from 'typeorm';
import { Column, Workbook } from 'exceljs';
import { Readable } from 'stream';

import {
  checkIncorrectOrderStateReducer,
  checkUpperCaseOrderStateReducer,
} from '../reducers/orders.reducer';
import { checkRequiredItemFieldsReducer } from '../reducers/items.reducer';
import { sort, splitSortProps } from '../common/sort';
import { paginator } from '../common/paginator';
import { filter } from '../common/filter';

import {
  GraingerItem,
  ItemStatusEnum,
} from '../grainger-items/grainger-items.entity';
import { OrderStatusEnum, Orders } from './orders.entity';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';
import { OrderItem } from './order-item.entity';
import { User } from '@user/users.entity';

import { EditOrderDto } from './dto/editOrder.dto';
import { CreateOrderDto } from './dto/createOrderDto';
import { GetOrderDto } from './dto/get-order.dto';
import { CsvCreateOrderDto } from './dto/csv-create-order.dto';

import { CollectionResponse } from '../common/collection-response';
import { AiService } from '../ai/ai.service';
import { GraingerItemsService } from '../grainger-items/grainger-items.service';
import { CsvService } from '@shared/csv/csv.service';

import { GraingerStatusEnum } from '../ai/dto/get-grainger-order';
import { INQUIRER } from '@nestjs/core';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly aiService: AiService,
    private readonly graingerItemsService: GraingerItemsService,
    private readonly csvService: CsvService,
    private readonly sentryService: SentryService,
  ) {}

  async find(where: any): Promise<Orders[]> {
    return this.ordersRepository.find(where);
  }

  async findOne(where: any): Promise<Orders> {
    return this.getOrderIfExist(where);
  }

  async getAll(where?, query?: any): Promise<CollectionResponse<GetOrderDto>> {
    const clause: any = {
      ...sort(query), // ????????????????
      ...paginator(query), // ????????????????
      ...filter(query),
    };
    clause.where = { ...clause.where, ...where };
    // clause.relations = ['items'];
    // const [result, count] = await this.ordersRepository.findAndCount(clause);

    const orders = this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('orders.user', 'user')
      .leftJoinAndSelect('items.graingerItem', 'graingerItem')
      .leftJoinAndSelect('graingerItem.graingerAccount', 'grainger-account')
      .leftJoinAndSelect('graingerItem.user', 'graingerItemUser');

    if (clause.where.user && clause.where.user.name) {
      orders.where('user.name =:name', { name: clause.where.user.name });
    }

    if (clause.take) {
      orders.take(clause.take);
    }

    if (clause?.skip) {
      orders.limit(clause.skip);
    }

    if (clause.where.status !== undefined) {
      const status = <any>{ status: clause.where.status };
      if (
        [OrderStatusEnum.PROCEED, OrderStatusEnum.INQUEUE].includes(
          clause.where.status,
        )
      ) {
        status.status = In([OrderStatusEnum.INQUEUE, OrderStatusEnum.PROCEED]);
      }
      orders.andWhere(status);
    }

    if (query?.sort_by) {
      const { sortType, sortDir } = splitSortProps(query.sort_by);
      orders.orderBy(`orders.${sortType}`, sortDir);
    }

    let result, count;
    try {
      [result, count] = await orders.getManyAndCount();
    } catch (e) {
      this.sentryService.error(e);
      this.logger.debug(e);
    }

    if (!result) {
      return {
        result: [],
        count: 0,
      };
    }

    return {
      result,
      count,
    };
  }

  async delete(where: any): Promise<any> {
    return this.ordersRepository.delete(where);
  }

  async exportToXlxs(
    res,
    statuses: { label: string; value: OrderStatusEnum }[],
    user: User,
  ) {
    let allItems: any = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin(User, 'users', 'users.id = orders.userId')
      .leftJoin(OrderItem, 'order-items', 'order-items.orderId = orders.id')
      .leftJoin(
        GraingerItem,
        'grainger-items',
        'grainger-items.id = order-items.graingerItemId',
      )
      .leftJoin(
        GraingerAccount,
        'grainger-account',
        'grainger-account.id = grainger-items.graingerAccountId',
      )
      .where('users.name =:name', { name: user.name })
      .select([
        'orders',
        'order-items',
        'users',
        'grainger-items',
        'grainger-account',
      ])
      .getRawMany();
    // let allItems: any = await this.getAll({
    //   user: {
    //     id: user.id,
    //   },
    // });

    const statusesDict = statuses.reduce(
      (acc, curr) => ({ ...acc, [curr.value]: curr.label }),
      {},
    );

    allItems = allItems.map((order) => ({
      ...order,
      orders_status: statusesDict[order.orders_status],
      graingerQuantity:
        order['order-items_amazonQuantity'] *
        (order[`grainger-items_graingerPackQuantity`] ?? 0),
    }));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    worksheet.columns = [
      { header: 'Amazon Order ID', key: 'orders_amazonOrderId', width: 20 },
      { header: 'Amazon Item ID', key: 'order-items_amazonItemId', width: 20 },
      {
        header: 'Amazon Quantity',
        key: 'order-items_amazonQuantity',
        width: 20,
      },
      { header: 'Grainger Quantity', key: 'graingerQuantity', width: 20 }, // ?????????? ??????????????
      { header: 'Login', key: 'users_email', width: 20 }, // ?????????? ??????????????
      { header: 'Amazon Account Name', key: 'users_name', width: 20 }, // ?????????? ??????????????
      {
        header: 'Grainger ItemNumber',
        key: 'grainger-items_graingerItemNumber',
        width: 20,
      },
      {
        header: 'Grainger PACKQTY',
        key: 'grainger-items_graingerPackQuantity',
        width: 20,
      },
      {
        header: 'Grainger Threshold',
        key: 'grainger-items_graingerThreshold',
        width: 20,
      },
      {
        header: 'Grainger Ship Date',
        key: 'order-items_graingerShipDate',
        width: 20,
      },
      {
        header: 'Grainger Tracking Number',
        key: 'order-items_graingerTrackingNumber',
        width: 20,
      },
      {
        header: 'Grainger Ship Method',
        key: 'order-items_graingerShipMethod',
        width: 20,
      },
      { header: 'Amazon SKU', key: 'order-items_amazonSku', width: 20 },
      { header: 'Recipient Name', key: 'orders_recipientName', width: 20 },
      { header: 'Order Status', key: 'orders_status', width: 20 },
      { header: 'Grainger Account', key: 'grainger-account_email', width: 20 },
      {
        header: 'Grainger Web Number',
        key: 'order-items_graingerWebNumber',
        width: 20,
      },
      {
        header: 'Grainger Order ID',
        key: 'order-items_graingerOrderId',
        width: 20,
      },
      { header: 'Order date', key: 'orders_orderDate', width: 20 },
      { header: 'Note', key: 'order-items_note', width: 20 },
    ] as Array<Column>;
    worksheet.addRows(allItems);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'orders.xlsx',
    );

    await workbook.xlsx.write(res);
    return workbook.xlsx.writeBuffer();
  }

  async uploadPricesFromCsv(
    stream: Readable,
    user,
  ): Promise<{ orders: Orders[] }> {
    const orderItemsDto = await this.convertPricesCsvToDto(stream);
    const pricesMap: { [amazonItemId: string]: number } = {};
    orderItemsDto.forEach(
      (orderItem) =>
        (pricesMap[orderItem.amazonItemId] = +orderItem.amazonPrice),
    );

    const uniqAmazonItemIds = this.getUniqFields(orderItemsDto, 'amazonItemId');

    // ?????????????? ?????? ???????????????????????? amazonItemId, ?????????? ???? ???? ?????????????? ?? ?? ?????????? ???????????????? "?????????? ?????? ????????"
    const existOrderItems: OrderItem[] = await this.orderItemsRepository.find({
      where: { amazonItemId: In(uniqAmazonItemIds) },
      relations: ['order'],
    });

    const orderIds = existOrderItems
      .map((orderItem) => orderItem.order)
      .map((orderItem) => orderItem.id);

    const orders: Orders[] = await this.ordersRepository.find({
      where: { id: In(orderIds) },
      relations: ['items'],
    });

    for (const order of orders) {
      for (const orderItem of order.items) {
        if (pricesMap[orderItem.amazonItemId]) {
          orderItem.amazonPrice = pricesMap[orderItem.amazonItemId];
        }
      }
      if (
        order.items.every(
          (orderItem) =>
            orderItem.amazonPrice &&
            !checkRequiredItemFieldsReducer(orderItem.graingerItem)
              .errorMessage,
        )
      ) {
        order.status = OrderStatusEnum.INQUEUE;
      }
    }

    await this.ordersRepository.save(orders);

    return {
      orders: orders.filter(
        (order) => order.status === OrderStatusEnum.INQUEUE,
      ),
    };
  }

  async uploadFromCsv(
    stream: Readable,
    user,
  ): Promise<{ success: OrderItem[]; errors: OrderItem[]; orders: Orders[] }> {
    let orderItemsDto = await this.convertCsvToDto(stream);

    const uniqAmazonItemIds = this.getUniqFields(orderItemsDto, 'amazonItemId');

    // ?????????????? ?????? ???????????????????????? amazonItemId, ?????????? ???? ???? ?????????????? ?? ?? ?????????? ???????????????? "?????????? ?????? ????????"
    const existOrderItems: OrderItem[] = await this.orderItemsRepository.find({
      where: { amazonItemId: In(uniqAmazonItemIds) },
      relations: ['order'],
    });

    const existAmazonItemIds = existOrderItems.map(
      (orderItem) => orderItem.amazonItemId,
    );

    orderItemsDto = orderItemsDto.filter(
      (el) => !existAmazonItemIds.includes(el.amazonItemId),
    );
    // await this.checkIfOrderItemsExist(uniqAmazonItemIds);

    // ?????????????????? ???????????????????? ???????????? ?????????? ???? ?????????????????? ???? ????????????????
    const uniqAmazonOrderIds = this.getUniqFields(
      orderItemsDto,
      'amazonOrderId',
    );
    const orders: Orders[] = await this.ordersRepository.find({
      where: { amazonOrderId: In(uniqAmazonOrderIds) },
      relations: ['items'],
    });

    // ?????????????????? ?????? ?????????????????????? graingerAccount ?????????? ?????????????????? ?? graingerItems ?? ?????????????? ?????????????????? ??????????
    const uniqAmazonSkus = this.getUniqFields(orderItemsDto, 'amazonSku');
    const existActiveGraingerItems = await this.graingerItemsService.find({
      amazonSku: In(uniqAmazonSkus),
      status: ItemStatusEnum.ACTIVE,
    });

    // ???????????????????? ???? DTO ?? ?????????????? ?????? ???????????? ?? ???????????? ????????????, ?????????????? ?????? ???? ????????????????????
    for (const dtoOrder of orderItemsDto) {
      let existAmazonOrder: Orders = orders.find(
        (amazonOrder) => amazonOrder.amazonOrderId === dtoOrder.amazonOrderId,
      );
      if (!existAmazonOrder) {
        existAmazonOrder = Orders.create(dtoOrder) as any;
        existAmazonOrder.user = user;
        existAmazonOrder.items = [];
        orders.push(existAmazonOrder);
      }

      let existOrderItem: OrderItem = existAmazonOrder.items.find(
        (i) => i.amazonItemId === dtoOrder.amazonItemId,
      );
      if (existOrderItem) {
        continue;
      }
      existOrderItem = OrderItem.create(dtoOrder) as any;
      existOrderItem.graingerItem = existActiveGraingerItems.find(
        (item) => item.amazonSku === existOrderItem.amazonSku,
      );
      const { errorMessage } = checkRequiredItemFieldsReducer(
        existOrderItem.graingerItem,
      );

      if (!existOrderItem.amazonPrice) {
        existAmazonOrder.status = OrderStatusEnum.WITHOUTPRICE;
      }

      if (errorMessage) {
        existAmazonOrder.status = OrderStatusEnum.MANUAL;
      }

      existAmazonOrder.items.push(existOrderItem);
    }

    // ???????? ???? CSV ???????????????? ???????????????? ???????????? ??????????????????????, ?????????? ???????????????? ?? ???????????? ????????
    orders
      .filter((order) => order.shipState?.length > 2)
      .forEach(checkUpperCaseOrderStateReducer);

    // ???????? ???? CSV ???????????????? ???????????????? ???????????? ????????????????????, ?????????? ?????????? ???????????? ????????????????
    orders
      .filter((order) => order.shipState?.length <= 2)
      .forEach(checkIncorrectOrderStateReducer);

    const savedOrders = await this.ordersRepository.save(orders);

    const success = savedOrders
      .reduce((acc, curr) => acc.concat(curr.items), [])
      .filter((orderItem) => !existOrderItems.includes(orderItem));

    return { success, errors: existOrderItems, orders: savedOrders };
  }

  private async convertPricesCsvToDto(
    stream: Readable,
  ): Promise<CsvCreateOrderDto[]> {
    const headers = [
      'amazonOrderId',
      'amazonItemId',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'amazonPrice',
    ];

    // ?????????????????? CSV ?? ???????????????? ?????? ?? ?????? ???????? ?????? ?????????????????????? ????????
    const orderItemsDto: CsvCreateOrderDto[] = await this.csvService.uploadFromCsv<CsvCreateOrderDto>(
      stream,
      headers,
      '\t',
    );
    if (
      orderItemsDto.some(
        (orderItem) => !this.csvService.isValidCSVRow(orderItem, headers),
      )
    ) {
      throw new HttpException(`Invalid CSV file`, HttpStatus.OK);
    }

    return orderItemsDto;
  }

  private async convertCsvToDto(
    stream: Readable,
  ): Promise<CsvCreateOrderDto[]> {
    const headers = [
      'amazonOrderId',
      'amazonItemId',
      'createdAt',
      null,
      null,
      null,
      null,
      null,
      'recipientName',
      null,
      'amazonSku',
      null,
      'amazonQuantity',
      null,
      null, //  'amazonPrice',
      null,
      'recipientName',
      'shipAddress',
      null,
      null,
      'shipCity',
      'shipState',
      'shipPostalCode',
    ];

    // ?????????????????? CSV ?? ???????????????? ?????? ?? ?????? ???????? ?????? ?????????????????????? ????????
    const orderItemsDto: CsvCreateOrderDto[] = await this.csvService.uploadFromCsv<CsvCreateOrderDto>(
      stream,
      headers,
      '\t',
    );
    if (
      orderItemsDto.some(
        (orderItem) => !this.csvService.isValidCSVRow(orderItem, headers),
      )
    ) {
      throw new HttpException(`Invalid CSV file`, HttpStatus.OK);
    }

    return orderItemsDto;
  }

  async findByField(
    user: User,
    { amazonOrderId, amazonItemId },
  ): Promise<Orders[]> {
    return this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin(OrderItem, 'order-items', 'order-items.orderId = orders.id')
      .where('user.name =:name', { name: user.name })
      .andWhere('orders.amazonOrderId LIKE :amazonOrderId', {
        amazonOrderId: `%${amazonOrderId}%`,
      })
      .orWhere('order-items.amazonItemId LIKE :amazonItemId', {
        amazonItemId: `%${amazonItemId}%`,
      })
      .select()
      .getMany();
  }

  async save(data: CreateOrderDto): Promise<Orders> {
    await this.validateOrder(data);
    const ordersItems = data.items.map((item: OrderItem) =>
      OrderItem.create(item),
    );
    const orders = { ...data, items: ordersItems };

    return this.ordersRepository.save(Orders.create(orders));
  }

  async updateStatus(
    where: {
      id: any;
      user: {
        name: string;
      };
    },
    status: OrderStatusEnum,
  ): Promise<Orders> {
    const existOrder = await this.getOrderIfExist(where);

    // ?????????????????????? ???? ???????? OrderItem, ?????????????????? ???????????????? ???? ?? ?????? ??????????????????????????
    const orderItemWithoutGraingerItems: OrderItem[] = existOrder.items.filter(
      (i) => !i.graingerItem || i.graingerItem.status !== ItemStatusEnum.ACTIVE,
    );
    for (const orderItem of orderItemWithoutGraingerItems) {
      orderItem.graingerItem = await this.graingerItemsService.findOne({
        amazonSku: orderItem.amazonSku,
      });
      if (!orderItem.amazonPrice) {
        existOrder.status = OrderStatusEnum.WITHOUTPRICE;
      }

      const { errorMessage } = checkRequiredItemFieldsReducer(
        orderItem.graingerItem,
      );
      if (errorMessage) {
        existOrder.status = OrderStatusEnum.MANUAL;
      } else {
        orderItem.graingerItem.status = ItemStatusEnum.ACTIVE;
      }
    }

    // ???????? ???????? ?????????? ???? ???????? ??????????, ?????????????????? ???? ?????? ?????????????? ???????????????? ?? ???????????? ????????????
    if (
      [
        OrderStatusEnum.MANUAL,
        OrderStatusEnum.ERROR,
        OrderStatusEnum.WITHOUTPRICE,
      ].includes(existOrder.status)
    ) {
      await this.ordersRepository.save(existOrder);
      const haveInactiveItem = existOrder.items.some(
        ({ graingerItem }) =>
          !!checkRequiredItemFieldsReducer(graingerItem).errorMessage,
      );
      if (haveInactiveItem) {
        throw new HttpException(
          `All order items must have status ACTIVE`,
          HttpStatus.OK,
        );
      }
      const withoutPriceItem = existOrder.items.some(
        ({ amazonPrice }) => !amazonPrice,
      );
      if (withoutPriceItem) {
        throw new HttpException(
          `All order items must have Amazon Item Price`,
          HttpStatus.OK,
        );
      }
    }

    existOrder.status = status;
    return this.ordersRepository.save(existOrder);
  }

  /**
   * ???????????? AI ???????????? ???????????????? graingerTrackingNumber
   */
  @Interval(1000 * 60 * 60)
  async updateGraingerTrackingNumberFromAI() {
    const orderItems = await this.orderItemsRepository
      .createQueryBuilder('items')
      .leftJoinAndSelect('items.graingerItem', 'graingerItem')
      .leftJoinAndSelect('graingerItem.graingerAccount', 'graingerAccount')
      .where(
        `items.graingerWebNumber != '' AND (items.graingerTrackingNumber = '' OR items.graingerTrackingNumber isnull)`,
      )
      .getMany();

    if (orderItems.length) {
      const graingerOrdersToAI = orderItems.map((orderItem) => ({
        graingerOrderId: orderItem.graingerOrderId,
        account_id: orderItem.graingerItem?.graingerAccount?.id,
        g_web_number: orderItem.graingerWebNumber,
        amazonPrice: orderItem.amazonPrice,
      }));

      try {
        const { success } = await this.aiService.updateTrackingNumberFromAI(
          graingerOrdersToAI,
        );
        this.logger.debug(
          `[Update GraingerTrackingNumber from AI] Sended: ${orderItems.length}`,
        );
      } catch (e) {
        this.sentryService.error(e);
        this.logger.error(
          '[Update GraingerTrackingNumber from AI] AI Service Timeout',
        );
      }
    }
  }

  /**
   * ???????????????? ?????? ???????????? ???? ???????????????? Proceed, ?????????????????????? ?? AI ???????????? ???? ??????
   */
  @Interval(10000)
  async updateOrderStatusesFromAI() {
    const orders = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('items.graingerItem', 'graingerItem')
      .where({
        status: In([OrderStatusEnum.INQUEUE, OrderStatusEnum.PROCEED]),
      })
      .orWhere(
        `orders.status = :status AND items.graingerWebNumber != '' AND (items.graingerTrackingNumber = '' OR items.graingerTrackingNumber isnull)`,
        {
          status: OrderStatusEnum.SUCCESS,
        },
      )
      .getMany();

    if (!orders.length) {
      return;
    }
    try {
      const {
        amazonOrders,
        error,
      } = await this.aiService.getOrderStatusesFromAI(
        orders.map((order) => order.amazonOrderId),
      );
      if (error) {
        throw new HttpException(error.message, HttpStatus.OK);
      }
      amazonOrders.forEach((amazonOrderFromAI) => {
        const existOrder = orders.find(
          (order) => order.amazonOrderId === amazonOrderFromAI.amazonOrderId,
        );

        if (!existOrder) {
          return;
        }
        existOrder.status = (amazonOrderFromAI.status as number) as OrderStatusEnum;
        if (amazonOrderFromAI.status === GraingerStatusEnum.Success) {
          existOrder.orderDate = existOrder.orderDate ?? new Date();
        }

        amazonOrderFromAI.graingerOrders.forEach((graingerOrderFromAI) => {
          graingerOrderFromAI.items.forEach((graingerItemFromAI) => {
            const existItem = existOrder.items.find(
              (item) =>
                item.graingerItem?.graingerItemNumber ===
                graingerItemFromAI.graingerItemNumber,
            );
            if (!existItem) {
              return;
            }
            existItem.graingerPrice = graingerItemFromAI.graingerPrice || null;
            existItem.graingerTrackingNumber =
              graingerOrderFromAI.graingerTrackingNumber || null;
            existItem.error = graingerOrderFromAI.error || null;
            existItem.graingerWebNumber =
              graingerOrderFromAI.g_web_number || null;
            existItem.graingerOrderId = graingerOrderFromAI.graingerOrderId;

            existOrder.items = [...existOrder.items, existItem];
          });
        });
      });

      await this.ordersRepository.save(orders);

      const amazonOrdersStatus = {
        successOrdersCount: [],
        waitCount: [],
        pendingCount: [],
        errorOrdersCount: [],
      };

      amazonOrders.forEach((order) => {
        switch (order.status) {
          case GraingerStatusEnum.INQUEUE:
            amazonOrdersStatus.waitCount.push(order);
            break;
          case GraingerStatusEnum.Error:
            amazonOrdersStatus.pendingCount.push(order);
            break;
          case GraingerStatusEnum.Proceed:
            amazonOrdersStatus.pendingCount.push(order);
            break;
          case GraingerStatusEnum.Success:
            amazonOrdersStatus.successOrdersCount.push(order);
            break;
        }
      });

      this.logger.debug(
        // eslint-disable-next-line max-len
        `[Check Order AI Status] Success: ${amazonOrdersStatus.successOrdersCount.length}, Wait: ${amazonOrdersStatus.waitCount.length}, Pending: ${amazonOrdersStatus.pendingCount.length}, Error: ${amazonOrdersStatus.errorOrdersCount.length}`,
      );
    } catch (e) {
      this.sentryService.error(e);
      this.logger.error('[Check Order AI Status] AI Service Timeout');
    }
  }

  async update(
    where: {
      id: string;
      user: {
        id: string;
      };
    },
    item: EditOrderDto,
  ): Promise<Orders> {
    const existOrder = await this.validateOrder({ ...where, ...item });
    const updated = Object.assign(existOrder, item);
    updated.items = updated.items.map((orderItem) =>
      orderItem.id ? orderItem : OrderItem.create(orderItem),
    );
    return this.ordersRepository.save(updated);
  }

  private async validateOrder(orderDto: CreateOrderDto): Promise<Orders> {
    // ?? ???????????? ???????????? ???????? ???????? ???? ???????? orderItem
    if (!orderDto.items.length) {
      throw new HttpException(
        `Order must have one or more Order item`,
        HttpStatus.OK,
      );
    }

    const existOrder: Orders = await this.ordersRepository.findOne({
      where: { amazonOrderId: orderDto.amazonOrderId },
      relations: ['items'],
    });

    let amazonItemIds = orderDto.items.map((item) => item.amazonItemId);

    // ???????? ?????????????????????? ???????????????????????? ??????????
    if (existOrder && orderDto.id === existOrder.id) {
      // ???????????? ?????? orderItem ?????????????? ?????? ???? ???????? ??????????????????
      const existAmazonItemIds = existOrder.items.map(
        (orderItem) => orderItem.amazonItemId,
      );
      const uniqAmazonItemIds = this.getUniqFields(amazonItemIds);
      // ???????? ?????????? ???????????????????? amazonItemId ???????? ??????????????????
      if (uniqAmazonItemIds.length !== amazonItemIds.length) {
        throw new HttpException(
          `Order items must have unique Amazon Item Id`,
          HttpStatus.OK,
        );
      }

      amazonItemIds = amazonItemIds.filter(
        (amazonItemId) => !existAmazonItemIds.includes(amazonItemId),
      );
    } else {
      // ???????? ?????????????? ?????????? ??????????, ?? ?????????? amazonOrderId ?????? ????????
      if (existOrder) {
        throw new HttpException(
          `Order with same Amazon Order Id "${orderDto.amazonOrderId}" already exist`,
          HttpStatus.OK,
        );
      }
    }

    await this.checkIfOrderItemsExist(amazonItemIds);

    return existOrder;
  }

  private async checkIfOrderItemsExist(amazonItemIds: string[]) {
    const existOrderItems: OrderItem[] = await this.orderItemsRepository.find({
      where: { amazonItemId: In(amazonItemIds) },
    });

    if (existOrderItems.length) {
      throw new HttpException(
        `Order Items with same Amazon Item Id ${existOrderItems[0].amazonItemId} already exist`,
        HttpStatus.OK,
      );
    }
  }

  private async getOrderIfExist(where: any): Promise<Orders> {
    // const existOrder = await this.ordersRepository.findOne({
    //   where,
    //   relations: ['items'],
    // });

    const existOrder = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('orders.user', 'user')
      .where({ id: where.id })
      .andWhere('user.name =:name', { name: where.user.name })
      .getOne();

    if (!existOrder) {
      throw new HttpException(`Order doesn't exist`, HttpStatus.OK);
    }

    return existOrder;
  }

  private getUniqFields = (array: any[], field?: string) => {
    return [...new Set(array.map((item) => (field ? item[field] : item)))];
  };
}
