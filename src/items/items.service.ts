import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatorQuery, paginator } from '../common/paginator';
import { sort } from '../common/sort';
import { EditItemDto } from './dto/editItem.dto';

import { ItemDto } from './dto/item.dto';
import { Items } from './item.entity';

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

  async getAll(query: any): Promise<Items[]> {
    const clause: any = {
      ...sort(query),
      ...paginator(query),
    };
    return await this.productsRepository.find(clause);
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
    console.log(data);
    if (!(data instanceof Items)) {
      entity = Items.create(data);
    }
    console.log(entity);
    try {
      return await this.productsRepository.save(entity);
    } catch (e) {
      throw new Error(e);
    }
  }
  async update(id: { id: string }, item: EditItemDto): Promise<Items> {
    const toUpdate = await this.productsRepository.findOne(id);
    const updated = Object.assign(toUpdate, item);
    return await this.productsRepository.save(updated);
  }

  async updateRaw({ where, data }: { where: any; data: any }): Promise<any> {
    return await this.productsRepository.update(where, data);
  }
}
