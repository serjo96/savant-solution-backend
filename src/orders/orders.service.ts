import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { paginator } from '../common/paginator';
import { sort, splitSortProps } from '../common/sort';
import { EditOrderDto } from './dto/editOrder.dto';

import { CreateOrderDto } from './dto/createOrderDto';
import { GetOrderDto } from './dto/get-order.dto';
import { OrderStatusEnum, Orders } from './orders.entity';
import { CollectionResponse } from '../common/collection-response';
import { Readable } from 'stream';
import { Column, Workbook } from 'exceljs';
import { OrderItem } from './order-item.entity';
import { checkRequiredItemFieldsReducer } from '../reducers/items.reducer';
import {
  checkIncorrectOrderStateReducer,
  checkUpperCaseOrderStateReducer,
} from '../reducers/orders.reducer';
import { Interval } from '@nestjs/schedule';
import { AiService } from '../ai/ai.service';
import { GraingerStatusEnum } from '../ai/dto/get-grainger-order';
import { User } from '@user/users.entity';
import {
  GraingerItem,
  ItemStatusEnum,
} from '../grainger-items/grainger-items.entity';
import { GraingerItemsService } from '../grainger-items/grainger-items.service';
import { filter } from '../common/filter';
import { CsvService } from '@shared/csv/csv.service';
import { CsvCreateOrderDto } from './dto/csv-create-order.dto';
import { GraingerAccount } from '../grainger-accounts/grainger-account.entity';

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
  ) {}

  async find(where: any): Promise<Orders[]> {
    return this.ordersRepository.find(where);
  }

  async findOne(where: any): Promise<Orders> {
    return this.getOrderIfExist(where);
  }

  async getAll(where?, query?: any): Promise<CollectionResponse<GetOrderDto>> {
    const clause: any = {
      ...sort(query), // поломано
      ...paginator(query), // поломано
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
        [OrderStatusEnum.PROCEED, OrderStatusEnum.WAITFORPROCEED].includes(
          clause.where.status,
        )
      ) {
        status.status = In([
          OrderStatusEnum.WAITFORPROCEED,
          OrderStatusEnum.PROCEED,
        ]);
      }
      orders.andWhere(status);
    }

    // if (clause.where.id) {
    //   orders.andWhere(clause.where.id);
    // }

    // if (clause?.where.graingerItemNumber) {
    //   orders.where({
    //     graingerItemNumber: clause.where.graingerItemNumber,
    //   });
    // }

    // Для фронта, не трогай плз
    if (query?.sort_by) {
      const { sortType, sortDir } = splitSortProps(query.sort_by);
      orders.orderBy(`orders.${sortType}`, sortDir);
    }

    if (query?.order) {
      const { sortType, sortDir } = splitSortProps(query.order);
      orders.orderBy(`orders.${sortType}`, sortDir);
    }

    let result, count;
    try {
      [result, count] = await orders.getManyAndCount();
    } catch (e) {
      this.logger.debug(e);
    }

    if (!result) {
      return {
        result: [],
        count: 0,
      };
    }

    return {
      result: result.map((order: Orders) => plainToClass(GetOrderDto, order)),
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
      { header: 'Grainger Quantity', key: 'graingerQuantity', width: 20 }, // нужно считать
      { header: 'Login', key: 'users_email', width: 20 }, // нужно считать
      { header: 'Amazon Account Name', key: 'users_name', width: 20 }, // нужно считать
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

  async uploadFromCsv(
    stream: Readable,
    user,
  ): Promise<{ success: OrderItem[]; errors: OrderItem[]; orders: Orders[] }> {
    let orderItemsDto = await this.convertCsvToDto(stream);

    const uniqAmazonItemIds = this.getUniqFields(orderItemsDto, 'amazonItemId');

    // Находим уже существующие amazonItemId, чтобы их не трогать и в конце написать "Такие уже есть"
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

    // Подгрузим уникальные заказы чтобы не создавать их повторно
    const uniqAmazonOrderIds = this.getUniqFields(
      orderItemsDto,
      'amazonOrderId',
    );
    const orders: Orders[] = await this.ordersRepository.find({
      where: { amazonOrderId: In(uniqAmazonOrderIds) },
      relations: ['items'],
    });

    // Подгрузим все необходимые graingerAccount чтобы присвоить в graingerItems у которых совпадает логин
    const uniqAmazonSkus = this.getUniqFields(orderItemsDto, 'amazonSku');
    const existActiveGraingerItems = await this.graingerItemsService.find({
      amazonSku: In(uniqAmazonSkus),
      status: ItemStatusEnum.ACTIVE,
    });

    // Пробежимся по DTO и добавим все заказы и детали заказа, которых еще не существует
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
      if (errorMessage) {
        existAmazonOrder.status = OrderStatusEnum.MANUAL;
        existAmazonOrder.note = (existAmazonOrder.note ?? '') + errorMessage;
      }
      existAmazonOrder.items.push(existOrderItem);
    }

    // Если из CSV приходят названия штатов апперкейсом, нужно привести к общему виду
    orders
      .filter((order) => order.shipState?.length > 2)
      .forEach(checkUpperCaseOrderStateReducer);

    // Если из CSV приходят названия штатов сокращенно, нужно найти полное название
    orders
      .filter((order) => order.shipState?.length <= 2)
      .forEach(checkIncorrectOrderStateReducer);

    const savedOrders = await this.ordersRepository.save(orders);

    const success = savedOrders
      .reduce((acc, curr) => acc.concat(curr.items), [])
      .filter((orderItem) => !existOrderItems.includes(orderItem));

    existOrderItems.forEach((orderItem) => {
      orderItem.errors = `Order Items already exist`;
    });

    return { success, errors: existOrderItems, orders: savedOrders };
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

    // Прочитаем CSV и проверим что в ней есть все необходимые поля
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

    // Пробегаемся по всем OrderItem, проверяем починили ли у них сопоставления
    const orderItemWithoutGraingerItems: OrderItem[] = existOrder.items.filter(
      (i) => !i.graingerItem || i.graingerItem.status !== ItemStatusEnum.ACTIVE,
    );
    for (const orderItem of orderItemWithoutGraingerItems) {
      orderItem.graingerItem = await this.graingerItemsService.findOne({
        amazonSku: orderItem.amazonSku,
      });
      const { errorMessage } = checkRequiredItemFieldsReducer(
        orderItem.graingerItem,
      );
      if (errorMessage) {
        existOrder.status = OrderStatusEnum.MANUAL;
        existOrder.note = (existOrder.note ?? '') + errorMessage;
      } else {
        orderItem.graingerItem.status = ItemStatusEnum.ACTIVE;
      }
    }

    // Если таки заказ не весь готов, сохраняем то что удалось изменить и кидаем ошибку
    if (
      [OrderStatusEnum.MANUAL, OrderStatusEnum.ERROR].includes(
        existOrder.status,
      )
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
    }

    existOrder.status = status;
    return this.ordersRepository.save(existOrder);
  }

  /**
   * Просит AI начать отдавать graingerTrackingNumber
   */
  @Interval(1000 * 15 * 60)
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
      }));

      try {
        const { success } = await this.aiService.updateTrackingNumberFromAI(
          graingerOrdersToAI,
        );
        this.logger.debug(
          `[Update GraingerTrackingNumber from AI] Sended: ${orderItems.length}`,
        );
      } catch (e) {
        this.logger.error(
          '[Update GraingerTrackingNumber from AI] AI Service Timeout',
        );
      }
    }
  }

  /**
   * Получает все заказы со статусом Proceed, запрашивает у AI статус по ним
   */
  @Interval(10000)
  async updateOrderStatusesFromAI() {
    const orders = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('items.graingerItem', 'graingerItem')
      .where({
        status: In([OrderStatusEnum.WAITFORPROCEED, OrderStatusEnum.PROCEED]),
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
            existItem.graingerWebNumber =
              graingerOrderFromAI.g_web_number || null;
            existItem.graingerOrderId = graingerOrderFromAI.graingerOrderId;

            existOrder.items = [...existOrder.items, existItem];
          });
        });
      });

      await this.ordersRepository.save(orders);

      const successOrdersCount = amazonOrders.filter(
        (order) => order.status === GraingerStatusEnum.Success,
      ).length;
      const waitCount = amazonOrders.filter((order) =>
        [GraingerStatusEnum.WaitForProceed].includes(order.status),
      ).length;
      const pendingCount = amazonOrders.filter((order) =>
        [GraingerStatusEnum.Proceed].includes(order.status),
      ).length;
      const errorOrdersCount = amazonOrders.filter(
        (order) => order.status === GraingerStatusEnum.Error,
      ).length;

      this.logger.debug(
        `[Check Order AI Status] Success: ${successOrdersCount}, Wait: ${waitCount}, Pending: ${pendingCount}, Error: ${errorOrdersCount}`,
      );
    } catch (e) {
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
    // У заказа должен быть хотя бы один orderItem
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

    // Если редактируем существующий заказ
    if (existOrder && orderDto.id === existOrder.id) {
      // Сверим все orderItem которые еще не были добавлены
      const existAmazonItemIds = existOrder.items.map(
        (orderItem) => orderItem.amazonItemId,
      );
      const uniqAmazonItemIds = this.getUniqFields(amazonItemIds);
      // Если среди присланных amazonItemId есть дубликаты
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
      // Если создаем новый заказ, а такой amazonOrderId уже есть
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
