import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CollectionResponse } from '../common/collection-response';

interface ISearchResult<T> {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: Array<{
      _source: T;
    }>;
  };
}

interface ISearchParams<T> {
  query: T;
  index: string;
  offset?: number;
  count?: number;
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
      throw new Error(`[ELASTIC CREATEINDEX]: ${error}`);
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
      throw new Error(`[ELASTIC DELETEINDEX]: ${error}`);
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
        this.logger.debug(erroredDocuments);
      }

      return bulkResponse;
    } catch (error) {
      this.logger.debug(error);
      throw new Error(`[ELASTIC SAVE]: ${error}`);
    }
  }

  async update<T>(data: any, index: string): Promise<any> {
    try {
      return await this.esService.update({
        index,
        id: data.id,
        body: {
          doc: {
            ...data,
          },
        },
      });
    } catch (error) {
      throw new Error(`[ELASTIC UPDATE]: ${error}`);
    }
  }

  async remove(entityId: string | string[], index: string) {
    try {
      return await this.esService.deleteByQuery({
        index,
        body: {
          query: {
            bool: {
              filter: {
                terms: {
                  id: entityId,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`[ELASTIC REMOVE]: ${error}`);
    }
  }

  async search<T>({
    query,
    index,
    offset,
    count,
  }: ISearchParams<T>): Promise<CollectionResponse<T>> {
    try {
      const { body } = await this.esService.search<ISearchResult<T>>({
        index,
        from: offset,
        size: count,
        body: {
          query,
        },
      });
      const hits = body.hits.hits;
      return {
        result: hits.map((item) => item._source),
        count: body.hits.total.value,
      };
    } catch (error) {
      this.logger.error(error);
      throw new Error(`[ELASTIC SEARCH]: ${error}`);
    }
  }

  parseAndPrepareData<T>(index: string, data: Array<any>): Array<any> {
    return data.reduce(
      (acc, element) =>
        acc.concat({ index: { _index: index, _id: element.id } }, element),
      [],
    );
  }
}
