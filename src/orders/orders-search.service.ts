import { Injectable } from '@nestjs/common';
import { CollectionResponse } from '../common/collection-response';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery } from '../common/sort';
import { SearchService } from '../search/search.service';
import { GetOrderDto } from './dto/get-order.dto';
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
          id: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          recipientName: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          note: { type: 'text' },
          orderDate: { type: 'date' },
          shipDate: { type: 'date' },
          carrierCode: { type: 'text' },
          carrierName: { type: 'text' },
          amazonOrderId: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          shipAddress: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          shipCity: { type: 'text' },
          shipState: { type: 'text' },
          shipPostalCode: { type: 'text' },
          status: { type: 'short' },
          items: {
            type: 'nested',
            include_in_root: true,
            properties: {
              ...this.searchService.baseEntityMapping,
              amazonItemId: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
              amazonSku: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
              amazonQuantity: { type: 'integer' },
              amazonPrice: { type: 'integer' },
              graingerPrice: { type: 'integer' },
              graingerTrackingNumber: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
              graingerShipMethod: { type: 'short' },
              graingerOrderId: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
              graingerShipDate: { type: 'date' },
              graingerWebNumber: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
              note: { type: 'text' },
              errors: { type: 'text' },
              graingerItem: {
                type: 'nested',
                include_in_root: true,
                properties: {
                  graingerItemNumber: {
                    type: 'text',
                    fields: {
                      keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                      },
                    },
                  },
                },
              },
            },
          },
          user: {
            type: 'nested',
            include_in_root: true,
          },
        },
      },
    };
    await this.searchService.createIndex(this.elasticIndex, indexConfig);
  }

  async deleteEsIndex() {
    return await this.searchService.deleteIndex(this.elasticIndex);
  }

  search(
    query: SortWithPaginationQuery | any,
    userName?: string,
  ): Promise<CollectionResponse<GetOrderDto>> {
    const clause: any = {
      offset: query.offset,
      limit: query.count,
      ...paginator(query),
      index: this.elasticIndex,
      query: {
        bool: {
          must: {
            multi_match: {
              type: 'most_fields',
              query: query.search,
              fields: [
                'id',
                'recipientName',
                'amazonOrderId.keyword',
                'items.amazonItemId',
                'items.amazonSku.keyword',
                'items.graingerTrackingNumber',
                'items.graingerOrderId',
                'items.graingerWebNumber',
                'items.graingerItem.graingerItemNumber',
              ],
            },
          },
          filter: {
            bool: {
              filter: [
                {
                  term: {
                    'user.name.keyword': userName,
                  },
                },
              ],
            },
          },
        },
      },
    };
    return this.searchService.search<Orders>(clause);
  }

  save<Orders>(data: Orders | Array<Orders>): any {
    let convertedData;
    if (Array.isArray(data)) {
      convertedData = this.searchService.parseAndPrepareData<Array<Orders>>(
        this.elasticIndex,
        data,
      );
    } else {
      convertedData = this.searchService.parseAndPrepareData<Array<Orders>>(
        this.elasticIndex,
        [data],
      );
    }
    return this.searchService.save(this.elasticIndex, convertedData);
  }

  update(data: Partial<Orders>): Promise<any> {
    return this.searchService.update<Orders>(data, this.elasticIndex);
  }

  delete(ids: string | string[]) {
    return this.searchService.remove(ids, this.elasticIndex);
  }
}
