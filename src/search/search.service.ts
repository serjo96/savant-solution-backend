import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BadRequestException } from '../common/exceptions/bad-request';
// import * as moviesJson from '../../../movies.json';
import { ConfigService } from '../config/config.service';

interface IMoviesJsonResponse {
  title: string;
  year: number;
  cast: string[];
  genres: string[];
}

interface PostSearchBody{
  some: any
};

interface PostSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: PostSearchBody;
    }>;
  };
}
@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}
  index = 'orders';

  async indexPost(post: any) {
    return this.elasticsearchService.index<any>({
      index: this.index,
      body: post
    })
  }

  async search(text: string) {
    this.elasticsearchService.on('request', (err, meta)=> {
      console.log(err);
      console.log('request', meta);
    });

    this.elasticsearchService.on('sniff', (err, meta)=> {
      console.log(err);
      console.log('sniff', meta);
    });

    this.elasticsearchService.on('response', (err, meta)=> {
      console.log(err);
      console.log('sniff', meta);
    });
    const { body } = await this.elasticsearchService.search<any>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['supplier', 'amazonSku']
          }
        }
      }
    })
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
