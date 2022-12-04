import { ParseNumber, SetDefaultValue } from '@decorators';
import { Expose } from 'class-transformer';
import { PaginationQueryDto } from '@dto';

export class CreatePaginationQueryDto extends PaginationQueryDto {
  @Expose()
  @ParseNumber()
  @SetDefaultValue(10)
  end: number;
}
