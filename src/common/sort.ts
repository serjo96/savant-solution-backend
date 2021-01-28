import { IsBoolean, IsOptional, IsString } from 'class-validator';
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
  @IsBoolean()
  @Type(() => Boolean)
  notMapped: boolean;

  @IsOptional()
  @IsString()
  amazonSku: string;
}

export default interface ISort {
  order: {
    [key: string]: string;
  };
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
    const [sortType, sortDir] = sort_by.split('.');
    result.order = {};
    result.order[sortType] = sortDir.toUpperCase();
  }

  return result;
};
