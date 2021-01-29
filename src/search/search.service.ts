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
  matchFields: {
    query: string;
  };
  index: string;
  offset?: number;
  count?: number;
}

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex<T>(data: any, index: string) {
    return this.elasticsearchService.index<ISearchResult<T>, T>({
      index,
      body: data,
    });
  }

  async update<T>(data: any, index: string) {
    const script = Object.entries(data).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.elasticsearchService.updateByQuery({
      index,
      body: {
        query: {
          match: {
            id: data.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }

  async search<T>({ matchFields, index, offset, count }: ISearchParams) {
    const { body } = await this.elasticsearchService.search<ISearchResult<T>>({
      index,
      from: offset,
      size: count,
      body: {
        query: {
          multi_match: {
            ...matchFields,
          },
        },
      },
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
