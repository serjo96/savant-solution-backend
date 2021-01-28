import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { paginator } from '../common/paginator';
import { sort } from '../common/sort';
import { SearchService } from '../search/search.service';
import { EditOrderDto } from './dto/editOrder.dto';

import { OrderDto } from './dto/order.dto';
import { ResponseOrdersDto } from './dto/response-orders.dto';
import { Orders } from './orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly searchService: SearchService,
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
  ): Promise<{ data: { result: ResponseOrdersDto[]; count: number } }> {
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
      data: {
        result: result.map((order: Orders) =>
          plainToClass(ResponseOrdersDto, order),
        ),
        count,
      },
    };
  }

  async delete(where: any): Promise<any> {
    const result = await this.ordersRepository.findOne(where);
    if (!result) {
      throw new NotFoundException();
    }
    return await this.ordersRepository.softDelete(where);
  }

  async saveAll(data: OrderDto[]): Promise<Orders[]> {
    const orders = data.map((order) => Orders.create(order));

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
      this.searchService.indexPost(entity);
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

  async updateRaw({ where, data }: { where: any; data: any }): Promise<any> {
    return await this.ordersRepository.update(where, data);
  }

  async search(query: any): Promise<any> {
    return this.searchService.search(query);
  }
}
