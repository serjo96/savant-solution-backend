import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsOrderDirection } from './decorators/sortValidation';
import { PaginatorQuery } from './paginator';
import { Type } from 'class-transformer';

export class SortBy {
  id = '';
  createdAt = '';
  updatedAt = '';
  deletedAt = '';
}

export class SortWithPaginationQuery extends PaginatorQuery {
  @IsOptional()
  @IsOrderDirection()
  sort_by: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  notMapped: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status: boolean;

  @IsOptional()
  @IsString()
  amazonSku: string;
}

export interface ISort {
  order: {
    [key: string]: string;
  };
}

export interface ISortSplit {
  sortType: string;
  sortDir: Partial<'ASC' | 'DESC'>;
}

export const sort = (query: SortWithPaginationQuery): ISort => {
  const result: ISort = {
    order: {
      createdAt: 'asc',
    },
  };

  if (!query) {
    return result;
  }

  const { sort_by } = query;

  if (sort_by) {
    const { sortType, sortDir } = splitSortProps(sort_by);
    result.order = {};
    result.order[sortType] = sortDir.toUpperCase();
  }

  return result;
};

export const splitSortProps = (query: string): ISortSplit => {
  const [sortType, sortDir] = query.split('.');
  return {
    sortType,
    sortDir: sortDir.toUpperCase() as ISortSplit['sortDir'],
  };
};
