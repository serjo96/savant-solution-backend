import ISort, { SortWithPaginationQuery } from './sort';
import { Not } from 'typeorm';

export const filter = (query: SortWithPaginationQuery): ISort => {
  let result: any = {
    where: {},
  };

  const { notMapped } = query;

  if (notMapped) {
    result = {
      where: {
        itemNumber: notMapped ? null : Not(null),
      },
    };
  }

  return result;
};
