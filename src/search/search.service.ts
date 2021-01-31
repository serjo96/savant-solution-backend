import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

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
  userId?: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}
  private readonly logger = new Logger(ElasticsearchService.name);

  async createIndex<T>(data: any, index: string) {
    return await this.elasticsearchService.index<ISearchResult<T>, T>({
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

  async remove(entityId: string, index: string) {
    this.elasticsearchService.deleteByQuery({
      index,
      body: {
        query: {
          match: {
            id: entityId,
          },
        },
      },
    });
  }

  async search<T>({
    matchFields,
    index,
    offset,
    count,
    userId,
  }: ISearchParams) {
    try {
      const { body } = await this.elasticsearchService.search<ISearchResult<T>>(
        {
          index,
          from: offset,
          size: count,
          body: {
            query: {
              multi_match: {
                ...matchFields,
                type: 'most_fields',
              },
            },
          },
        },
      );
      const hits = body.hits.hits;
      return {
        result: hits.map((item) => item._source),
        total: body.hits.total,
      };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
