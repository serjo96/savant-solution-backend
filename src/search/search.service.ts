import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
// import * as moviesJson from '../../../movies.json';
import { ConfigService } from '../config/config.service';

interface IMoviesJsonResponse {
  title: string;
  year: number;
  cast: string[];
  genres: string[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly esService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async createIndex() {
    const checkIndex = await this.esService.indices.exists({
      index: 'ELASTICSEARCH_INDEX',
    });
    if (checkIndex.statusCode === 404) {
      this.esService.indices.create(
        {
          index: 'ELASTICSEARCH_INDEX',
          body: {
            settings: {
              analysis: {
                analyzer: {
                  autocomplete_analyzer: {
                    tokenizer: 'autocomplete',
                    filter: ['lowercase'],
                  },
                  autocomplete_search_analyzer: {
                    tokenizer: 'keyword',
                    filter: ['lowercase'],
                  },
                },
                tokenizer: {
                  autocomplete: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 30,
                    token_chars: ['letter', 'digit', 'whitespace'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  fields: {
                    complete: {
                      type: 'text',
                      analyzer: 'autocomplete_analyzer',
                      search_analyzer: 'autocomplete_search_analyzer',
                    },
                  },
                },
                year: { type: 'integer' },
                genres: { type: 'nested' },
                actors: { type: 'nested' },
              },
            },
          },
        },
        (err) => {
          if (err) {
            console.error(err);
          }
        },
      );
      const body = await this.parseAndPrepareData();
      this.esService.bulk(
        {
          index: 'ELASTICSEARCH_INDEX',
          body,
        },
        (err) => {
          if (err) {
            console.error(err);
          }
        },
      );
    }
  }

  async search(search: string) {
    const results = [];
    const { body } = await this.esService.search({
      index: 'ELASTICSEARCH_INDEX',
      body: {
        size: 12,
        query: {
          match: {
            'title.complete': {
              query: search,
            },
          },
        },
      },
    });
    const hits = body.hits.hits;
    hits.map((item) => {
      results.push(item._source);
    });

    return { results, total: body.hits.total.value };
  }

  async parseAndPrepareData() {
    const body = [];
    const listMovies = [];
    listMovies.map((item, index) => {
      const actorsData = [];
      item.cast.map((actor) => {
        const splited = actor.split(' ');
        actorsData.push({ firstName: splited[0], lastName: splited[1] });
      });

      body.push(
        {
          index: {
            _index: 'ELASTICSEARCH_INDEX',
            _id: index,
          },
        },
        {
          title: item.title,
          year: item.year,
          genres: item.genres.map((genre) => ({ genre })),
          actors: actorsData,
        },
      );
    });
    return body;
  }
}
