import { ParseJson, ParseNumber, SetDefaultValue } from '@decorators';
import { Expose } from 'class-transformer';

export class PaginationQueryDto {
  @Expose()
  @ParseNumber()
  @SetDefaultValue(1)
  page: number;

  @Expose()
  @ParseJson()
  @SetDefaultValue(10)
  limit: number;
}
