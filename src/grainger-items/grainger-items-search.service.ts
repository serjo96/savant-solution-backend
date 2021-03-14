import { Injectable } from '@nestjs/common';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery } from '../common/sort';
import { GraingerItem } from './grainger-items.entity';
import { SearchService } from '../search/search.service';

@Injectable()
export class GraingerItemsSearchService {
  constructor(private readonly searchService: SearchService) {}
  private readonly elasticIndex = 'grainger-item';

  async createIndex() {
    const indexConfig = {
      mappings: {
        properties: {
          ...this.searchService.baseEntityMapping,
          id: { type: 'keyword' },
          amazonSku: { type: 'keyword' },
          graingerItemNumber: { type: 'keyword' },
          graingerPackQuantity: { type: 'integer' },
          graingerThreshold: { type: 'integer' },
          status: { type: 'short' },
          graingerAccount: {
            type: 'nested',
            properties: {
              email: { type: 'keyword' },
              name: { type: 'keyword' },
            },
          },
          orderItems: {
            type: 'nested',
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

  async search(
    query: SortWithPaginationQuery | any,
    userId?: string,
  ): Promise<any> {
    const clause: any = {
      offset: query.offset,
      limit: query.count,
      ...paginator(query),
      userId,
      index: this.elasticIndex,
      query: {
        bool: {
          must: {
            multi_match: {
              type: 'most_fields',
              query: query.search,
              fields: [
                'id',
                'amazonSku',
                'graingerItemNumber',
                'graingerAccount.email',
              ],
            },
          },
        },
      },
    };
    return this.searchService.search<GraingerItem>(clause);
  }

  save<GraingerItem>(data: GraingerItem | Array<GraingerItem>): any {
    let response;
    let convertedData;
    if (Array.isArray(data)) {
      convertedData = this.searchService.parseAndPrepareData<
        Array<GraingerItem>
      >(this.elasticIndex, data);

      response = this.searchService.save(this.elasticIndex, convertedData);
    } else {
      convertedData = this.searchService.parseAndPrepareData<
        Array<GraingerItem>
      >(this.elasticIndex, [data]);
      response = this.searchService.save(this.elasticIndex, convertedData);
    }
    return response;
  }

  update(data: Partial<GraingerItem>) {
    return this.searchService.update<GraingerItem>(data, this.elasticIndex);
  }

  delete(ids: string | string[]) {
    return this.searchService.remove(ids, this.elasticIndex);
  }
}
