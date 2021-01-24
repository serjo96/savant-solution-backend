import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { paginator } from '../common/paginator';
import { sort } from '../common/sort';
import { EditItemDto } from './dto/editItem.dto';

import { ItemDto } from './dto/item.dto';
import { ResponseItemsDto } from './dto/response-items.dto';
import { Items } from './item.entity';
import { filter } from '../common/filter';
import { CollectionResponse } from '../common/collection-response';
import { EditOrderDto } from '../orders/dto/editOrder.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Items)
    private readonly productsRepository: Repository<Items>,
  ) {}

  async find(where: any): Promise<Items[]> {
    return await this.productsRepository.find(where);
  }

  async findOne(where: any): Promise<Items> {
    const result = await this.productsRepository.findOne(where);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async getAll(
    where,
    query?: any,
  ): Promise<CollectionResponse<ResponseItemsDto>> {
    const clause: any = {
      ...sort(query),
      ...paginator(query),
      ...filter(query),
      where,
    };
    const [result, count] = await this.productsRepository.findAndCount(clause);

    if (!result) {
      throw new NotFoundException();
    }
    return {
      result: result.map((order: Items) =>
        plainToClass(ResponseItemsDto, order),
      ),
      count,
    };
  }

  async delete(where: any): Promise<any> {
    const result = await this.productsRepository.findOne(where);
    if (!result) {
      throw new NotFoundException();
    }
    return await this.productsRepository.softDelete(where);
  }

  async save(data: ItemDto): Promise<Items> {
    let entity = data;
    if (!(data instanceof Items)) {
      entity = Items.create(data);
    }
    try {
      return await this.productsRepository.save(entity);
    } catch (e) {
      throw new Error(e);
    }
  }
  async update(
    where: { id: string; userId: string },

    item: EditItemDto,
  ): Promise<Items> {
    const toUpdate = await this.productsRepository.findOne(where);
    const updated = Object.assign(toUpdate, item);
    return await this.productsRepository.save(updated);
  }
}
