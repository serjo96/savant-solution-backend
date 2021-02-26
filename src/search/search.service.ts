import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  constructor(private readonly esService: ElasticsearchService) {}
  private readonly logger = new Logger(ElasticsearchService.name);

  get baseEntityMapping() {
    return {
      id: { type: 'keyword' },
      createdAt: { type: 'date' },
      deletedAt: { type: 'date' },
      updatedAt: { type: 'date' },
    };
  }

  async createIndex<T>(index: string, data: any) {
    try {
      const checkIndex = await this.esService.indices.exists({ index });
      if (checkIndex.statusCode === 404) {
        return await this.esService.indices.create<ISearchResult<T>, T>({
          index,
          body: data,
        });
      }
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteIndex(index: string | string[]) {
    try {
      const existIndex = await this.esService.indices.exists({ index });
      if (!existIndex) {
        throw new NotFoundException();
      }
      return await this.esService.indices.delete({ index });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async save(index: string, data: any) {
    try {
      const { body: bulkResponse } = await this.esService.bulk({
        index,
        body: data,
      });

      if (bulkResponse.errors) {
        const erroredDocuments = [];
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              // If the status is 429 it means that you can retry the document,
              // otherwise it's very likely a mapping error, and you should
              // fix the document before to try it again.
              status: action[operation].status,
              error: action[operation].error,
              operation: data[i * 2],
              document: data[i * 2 + 1],
            });
          }
        });
        console.log(erroredDocuments);
      }

      return bulkResponse;
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update<T>(data: any, index: string): Promise<any> {
    const script = Object.entries(data).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    try {
      return await this.esService.updateByQuery({
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
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(entityId: string, index: string) {
    try {
      return await this.esService.deleteByQuery({
        index,
        body: {
          query: {
            match: {
              id: entityId,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async search<T>({
    matchFields,
    index,
    offset,
    count,
    userId,
  }: ISearchParams) {
    try {
      const { body } = await this.esService.search<ISearchResult<T>>({
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
      });
      const hits = body.hits.hits;
      return {
        result: hits.map((item) => item._source),
        total: body.hits.total,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  parseAndPrepareData<T>(index: string, data: Array<any>): Array<any> {
    console.log(data);
    return data.flatMap((element, indx: number) => [
      { index: { _index: index, _id: element.id || indx } },
      element,
    ]);
  }
}
