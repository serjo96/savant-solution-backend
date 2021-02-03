import { Injectable } from '@nestjs/common';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery } from '../common/sort';
import { SearchService } from '../search/search.service';
import { Orders } from './orders.entity';

@Injectable()
export class OrdersSearchService {
  constructor(private readonly searchService: SearchService) {}
  elasticIndex = 'orders';

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
    if (Array.isArray(data)) {
      data.forEach((order: Orders) => {
        response = this.searchService.createIndex(order, this.elasticIndex);
      });
    } else {
      response = this.searchService.createIndex(data, this.elasticIndex);
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
