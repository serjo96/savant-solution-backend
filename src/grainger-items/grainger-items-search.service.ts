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
          amazonSku: { type: 'keyword' },
          graingerItemNumber: { type: 'keyword' },
          graingerPackQuantity: { type: 'integer' },
          graingerThreshold: { type: 'integer' },
          status: { type: 'short' },
          graingerAccount: {
            type: 'nested',
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
      matchFields: {
        query: query.search,
        fields: ['amazonSku', 'graingerItemNumber'],
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

  delete(id: string) {
    return this.searchService.remove(id, this.elasticIndex);
  }
}
