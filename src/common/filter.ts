import ISort, { SortWithPaginationQuery } from './sort';
import { IsNull, Not } from 'typeorm';

export const filter = (query: SortWithPaginationQuery): ISort => {
  let result: any = {
    where: {},
  };

  if (!query) {
    return result;
  }

  const { notMapped } = query;

  if (notMapped) {
    result = {
      where: {
        graingerItemNumber: notMapped ? IsNull() : Not(null),
      },
    };
  }

  return result;
};
