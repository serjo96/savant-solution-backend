import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class PaginatorQuery {
  @IsOptional()
  @IsBoolean({
    message: '"all" должно иметь значение "true" или "false"',
  })
  all?: boolean;

  @IsOptional()
  @IsInt({
    message: 'Количество запрашиваемых объектов должно быть целым числом',
  })
  @Min(0, {
    message: 'Количество запрашиваемых объектов не может быть меньше ноля',
  })
  count?: number;

  @IsOptional()
  @IsInt({
    message: 'Порядковый номер объекта должен быть целым',
  })
  @Min(0, {
    message: 'Порядковый номер объекта не может быть меньше ноля',
  })
  offset?: number;
}

export interface PaginatorType {
  skip?: number | null;
  take?: number | null;
}

export const paginator = (value: PaginatorQuery): PaginatorType => {
  const result: PaginatorType = {};

  const { all, count, offset } = value;

  if (offset) {
    result.skip = offset;
  }

  if (count) {
    result.take = count;
  }

  if (all) {
    result.take = null;
    result.skip = null;
  }

  return result;
};
