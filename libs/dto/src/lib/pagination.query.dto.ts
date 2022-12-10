import { ParseJson, ParseNumber, SetDefaultValue } from '@decorators';
import { Expose } from 'class-transformer';

export class PaginationQueryDto {
  @Expose()
  @SetDefaultValue(1)
  @ParseNumber()
  page: number;

  @Expose()
  @SetDefaultValue(10)
  @ParseNumber()
  limit: number;
}
