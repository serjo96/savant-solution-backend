import ISort, { SortWithPaginationQuery } from './sort';
import { IsNull, Not } from 'typeorm';

export const filter = (query: SortWithPaginationQuery): ISort => {
  const result: any = {
    where: {},
  };

  if (!query) {
    return result;
  }

  const { notMapped, status } = query;

  if (notMapped) {
    result.where = {
      ...result.where,
      graingerItemNumber: notMapped ? IsNull() : Not(null),
    };
  }

  if (status !== undefined) {
    result.where = { ...result.where, status: status };
  }

  return result;
};
