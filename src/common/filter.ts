import ISort, { SortWithPaginationQuery } from './sort';
import { IsNull, Not } from 'typeorm';

export const filter = (query: SortWithPaginationQuery, where?: any): ISort => {
  let result: any = {
    where: {},
  };

  const { notMapped } = query;

  if (notMapped) {
    result = {
      where: {
        itemNumber: notMapped ? IsNull() : Not(null),
      },
    };
  }
  if (where) {
    result.where = { ...result.where, ...where };
  }

  return result;
};
