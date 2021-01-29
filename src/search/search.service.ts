import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BadRequestException } from '../common/exceptions/bad-request';
import { ConfigService } from '../config/config.service';

interface ISearchResult<T> {
  hits: {
    total: number;
    hits: Array<{
      _source: T;
    }>;
  };
}

interface ISearchParams {
  query: string;
  index: string;
  offset?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexPost<T>(post: any, index: string) {
    return this.elasticsearchService.index<ISearchResult<T>, T>({
      index,
      body: post,
    });
  }

  async search<T>({ query, index, offset, limit }: ISearchParams) {
    const { body } = await this.elasticsearchService.search<ISearchResult<T>>({
      index,
      from: offset,
      size: limit,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['supplier', 'amazonSku'],
          },
        },
      },
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
