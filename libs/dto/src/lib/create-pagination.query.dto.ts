import { ParseNumber, SetDefaultValue } from '@decorators';
import { Expose } from 'class-transformer';
import { PaginationQueryDto } from './pagination.query.dto';

export class CreatePaginationQueryDto extends PaginationQueryDto {
  @Expose()
  @SetDefaultValue(10)
  @ParseNumber()
  end: number;
}
