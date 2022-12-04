import { ParseJson, SetDefaultValue } from '@decorators';

export class SearchAllQueryDto<TWhere, TOrderBy> {
  @ParseJson()
  @SetDefaultValue({})
  where: TWhere;

  @ParseJson()
  @SetDefaultValue({})
  orderBy: TOrderBy;
}
