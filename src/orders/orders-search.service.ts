import { Injectable } from '@nestjs/common';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery } from '../common/sort';
import { SearchService } from '../search/search.service';
import { Orders } from './orders.entity';

@Injectable()
export class OrdersSearchService {
  constructor(private readonly searchService: SearchService) {}
  elasticIndex = 'orders';

  async createIndex() {
    const indexConfig = {
      mappings: {
        properties: {
          ...this.searchService.baseEntityMapping,
          recipientName: { type: 'keyword' },
          note: { type: 'text' },
          orderDate: { type: 'date' },
          shipDate: { type: 'date' },
          carrierCode: { type: 'text' },
          carrierName: { type: 'text' },
          amazonOrderId: { type: 'text' },
          shipAddress: { type: 'text' },
          shipCity: { type: 'text' },
          shipState: { type: 'text' },
          shipPostalCode: { type: 'text' },
          status: { type: 'short' },
          items: {
            type: 'nested',
            properties: {
              ...this.searchService.baseEntityMapping,
              id: { type: 'keyword' },
              amazonItemId: { type: 'text' },
              amazonSku: { type: 'text' },
              amazonQuantity: { type: 'integer' },
              amazonPrice: { type: 'integer' },
              graingerPrice: { type: 'integer' },
              graingerTrackingNumber: { type: 'keyword' },
              graingerShipMethod: { type: 'short' },
              graingerOrderId: { type: 'text' },
              graingerShipDate: { type: 'date' },
              graingerWebNumber: { type: 'keyword' },
              note: { type: 'text' },
              errors: { type: 'text' },
              graingerItem: { type: 'nested' },
            },
          },
          user: {
            type: 'nested',
          },
        },
      },
    };
    await this.searchService.createIndex(this.elasticIndex, indexConfig);
  }

  async deleteEsIndex() {
    return await this.searchService.deleteIndex(this.elasticIndex);
  }

  search(query: SortWithPaginationQuery | any, userId?: string): Promise<any> {
    const clause: any = {
      offset: query.offset,
      limit: query.count,
      ...paginator(query),
      index: this.elasticIndex,
      matchFields: {
        query: query.search,
        fields: [
          'recipientName',
          'id',
          'items.id',
          'items.graingerTrackingNumber',
          'items.graingerWebNumber',
        ],
      },
    };
    return this.searchService.search<Orders>(clause);
  }

  save<Orders>(data: Orders | Array<Orders>): any {
    let response;
    let convertedData;
    if (Array.isArray(data)) {
      convertedData = this.searchService.parseAndPrepareData<Array<Orders>>(
        this.elasticIndex,
        data,
      );

      response = this.searchService.save(this.elasticIndex, convertedData);
    } else {
      convertedData = this.searchService.parseAndPrepareData<Array<Orders>>(
        this.elasticIndex,
        [data],
      );
      response = this.searchService.save(this.elasticIndex, convertedData);
    }
    return response;
  }

  update(data: Partial<Orders>): Promise<any> {
    return this.searchService.update<Orders>(data, this.elasticIndex);
  }

  delete(id: string) {
    return this.searchService.remove(id, this.elasticIndex);
  }
}
