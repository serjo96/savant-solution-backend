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
@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexPost<T>(post: any, index: string) {
    this.elasticsearchService.on('request', (err, meta) => {
      console.log(err);
      console.log('request', meta);
    });

    this.elasticsearchService.on('sniff', (err, meta) => {
      console.log(err);
      console.log('sniff', meta);
    });

    this.elasticsearchService.on('response', (err, meta) => {
      console.log(err);
      console.log('sniff', meta);
    });
    return this.elasticsearchService.index<ISearchResult<T>, T>({
      index,
      body: post,
    });
  }

  async search<T>(query: string, index: string) {
    this.elasticsearchService.on('request', (err, meta) => {
      console.log(err);
      console.log('request', meta);
    });

    this.elasticsearchService.on('sniff', (err, meta) => {
      console.log(err);
      console.log('sniff', meta);
    });

    this.elasticsearchService.on('response', (err, meta) => {
      console.log(err);
      console.log('sniff', meta);
    });
    const { body } = await this.elasticsearchService.search<ISearchResult<T>>({
      index,
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
