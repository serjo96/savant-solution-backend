import { Injectable } from '@nestjs/common';
import { paginator } from '../common/paginator';
import { SortWithPaginationQuery } from '../common/sort';
import { GraingerItem } from './grainger-items.entity';
import { SearchService } from '../search/search.service';

@Injectable()
export class GraingerItemsSearchService {
  constructor(private readonly searchService: SearchService) {}
  private readonly elasticIndex = 'grainger-item';

  async search(
    query: SortWithPaginationQuery | any,
    userId?: string,
  ): Promise<any> {
    const clause: any = {
      offset: query.offset,
      limit: query.count,
      ...paginator(query),
      index: this.elasticIndex,
      matchFields: {
        query: query.search,
        fields: ['recipientName', 'id'],
      },
    };
    return this.searchService.search<GraingerItem>(clause);
  }

  save<GraingerItem>(data: GraingerItem): any {
    return this.searchService.createIndex(data, this.elasticIndex);
  }

  update(data: Partial<GraingerItem>) {
    return this.searchService.update<GraingerItem>(data, this.elasticIndex);
  }

  delete(id: string) {
    return this.searchService.remove(id, this.elasticIndex);
  }
}
